const axios = require('axios')
const schema = require('./schema')
const Ajv = require('ajv')
var fs = require('fs');
require.extensions['.xml'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
const baseConfig = require('./job_config.xml')
const instance = require('./utils').instance

module.exports = {
    isBlacklisted(Snowflake) {
        return process.env["BLACKLISTED_SNOWFLAKES"].includes(Snowflake)
    },
    async createJob(Module, Project, Snowflake, ConfigString) {
        // Check if the module folder exists in Jenkins
        await instance.get(`/job/Public/job/${Module}/api/json`).then(async (response) => {}).catch(async (error) => {
            // If it doesn't, create it
            await instance.post(`/job/Public/createItem?name=${Module}&mode=com.cloudbees.hudson.plugins.folder.Folder`)
        })
        // Check if the project folder exists in Jenkins
        await instance.get(`/job/Public/job/${Module}/job/${Project}/api/json`).then(async (response) => {}).catch(async (error) => {
            // If it doesn't, create it
            await instance.post(`/job/Public/job/${Module}/createItem?name=${Project}&mode=com.cloudbees.hudson.plugins.folder.Folder`)
        })
        // Check if the job exists in Jenkins
        await instance.get(`/job/Public/job/${Module}/job/${Project}/job/${Snowflake}/api/json`).then(async (response) => {
            // If it does, update the config.xml
            await instance.post(`/job/Public/job/${Module}/job/${Project}/job/${Snowflake}/config.xml`, ConfigString, { headers: { 'Content-Type': 'application/xml' } })
        }).catch(async (error) => {
            // If it doesn't, create it
            await instance.post(`/job/Public/job/${Module}/job/${Project}/createItem?name=${Snowflake}`, ConfigString, { headers: { 'Content-Type': 'application/xml' }})
        })
        // Run the job
        await instance.post(`/job/Public/job/${Module}/job/${Project}/job/${Snowflake}/build?delay=0sec`)
    },
    async getManifest(Module, Project) {
        const manifest = await axios.get(`https://api.github.com/repos/${process.env["GITHUB_ORGANIZATION"]}/${Module}-${Project}/contents/manifest.json`, { headers: { Authorization: `token ${process.env["GITHUB_TOKEN"]}` } })
        return JSON.parse(Buffer.from(manifest.data.content, 'base64').toString('utf8'))
    },
    async handle(Module, Project, Snowflake, event, payload, DiscordClient) {
        if (!Snowflake.match(/^[0-9]{18}$/))
            throw new Error('Invalid Discord ID, get yours by using the /id command with the Discord bot.')

        if (!payload || !payload.repository || payload.repository.private)
            throw new Error('Unable to read the repository, it is private.')

        const user = await DiscordClient.users.fetch(Snowflake)
        if (!user)
            throw new Error('Unable to find your Discord account, are you on our Discord server ?')

        switch (event) {
            case "ping":
                try {
                    await user.send({
                        embeds: [{
                            title: `[${Module}] ${Project}`,
                            description: "We received a ping from you, we will now test your project when you'll push on it.",
                            color: "#62c22f"
                        }]
                    })
                }
                catch (error) {
                    throw new Error("Unable to contact your Discord account")
                }
                return true
            case "push":
            case "pull_request":
                break;
            default:
                throw new Error(`Not supported GitHub event type : ${event}.`)
        }

        let manifest = null
        try {
            manifest = await this.getManifest(Module, Project)
            if (!manifest)
                throw new Error(`No tests found for [${Module}] ${Project}.`)
        }
        catch (e) {
            throw new Error(`No tests found for [${Module}] ${Project}.`)
        }
        const ajv = new Ajv()
        const validate = ajv.compile(schema)
        if (!validate(manifest)) {
            const errorsMap = validate.errors.map(err => err.message) // Get all errors messages
            throw new Error(`Error in the project manifest file : ${errorsMap.join(", ")}.`)
        }
        if (this.isBlacklisted(Snowflake))
            return true
        const script = `pipeline {
    agent {
        docker {
            image '${manifest["agent-image"]}'
            args '-u root'
            containerPerStageRoot true
            args '-v /var/marvin:/var/marvin'
            customWorkspace '/var/jenkins_home/agent/${Module}/${Project}/${Snowflake}/workspace'
            reuseNode true
        }
    }
    environment {
        REPORT = '{}'
    }
    stages {
        stage('Setup') {
            steps {
                sh '''
                    set +x
                    apt-get update && apt-get install -y git nodejs npm
                    rm -rf cloning-area
                    cp /var/marvin/* .
                    npm install
                    git clone https://github.com/${process.env["GITHUB_ORGANIZATION"]}/${Module}-${Project}.git cloning-area && mv cloning-area/* . && rm -rf cloning-area
                    git clone ${payload.repository.clone_url} cloning-area && mv cloning-area/* . && rm -rf cloning-area
                    set -x
                    node marvin.js --setup
                '''
            }
        }
        stage('Build') {
            steps {
                echo "========== BUILD LOGS =========="
                sh 'node marvin.js --build'
                echo "================================"
            }
        }
        stage('Testing') {
            steps {
                echo "========== TESTS LOGS =========="
                sh 'node marvin.js --tests'
                echo "================================"
            }
        }
    }
    post {
        always {
            script {
                REPORT = readFile(file: 'tests_report.json').trim()
            }
            build (
                propagate: false,
                wait: false,
                parameters: [
                    string (
                        name: 'COMMIT_HASH',
                        value: '${payload.commits.length > 0 ? payload.commits[0].id : '?'}'
                    ),
                    string (
                        name: 'COMMIT_MESSAGE',
                        value: '${payload.commits.length > 0 ? encodeURI(payload.commits[0].message) : 'No commit message'}'
                    ),
                    string (
                        name: 'COMMIT_TIME',
                        value: '${payload.commits.length > 0 ? payload.commits[0].timestamp : '0'}'
                    ),
                    string (
                        name: 'MODULE',
                        value: '${Module}'
                    ),
                    string (
                        name: 'PROJECT',
                        value: '${Project}'
                    ),
                    string (
                        name: 'DISCORD_SNOWFLAKE',
                        value: '${Snowflake}'
                    ),
                    string (
                        name: 'REPORT_AS_JSON',
                        value: REPORT
                    )
                ],
                job: 'Tools/SendReport'
            )
            echo "=== WORKSPACE BEFORE CLEANUP ==="
            sh 'ls -ltr'
            echo "================================"
            junit (
                skipMarkingBuildUnstable: true,
                testResults: 'tests_report.xml'
            )
            cleanWs (deleteDirs: true)
        }
    }
}`
        const encodedScript = script.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/#/g, '&')
        const JobConfig = baseConfig.toString().replace("{{DISPLAY_NAME}}", `${user.tag}`).replace("{{SCRIPT}}", encodedScript)
        try {
            await this.createJob(Module, Project, Snowflake, JobConfig)
        }
        catch (error) {
            throw new Error("Please contact the instance administrator, an error occured when requesting Jenkins : " + error)
        }
        // Send a message to the user
        // try {
        //     await user.send({
        //         embeds: [{
        //             title: `[${Module}] ${Project}`,
        //             description: "Marvin received a webhook from GitHub, we're starting your tests.",
        //             color: "#62c22f"
        //         }]
        //     })
        // }
        // catch (error) {
        //     throw new Error("Unable to contact your Discord account")
        // }
        return true
    }
}
