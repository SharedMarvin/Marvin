const fs = require('fs')
const manifest = require('./manifest.json')
const execSync = require('child_process').execSync

function formatStrXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/#/g, '&')
}

function createXml() {
    function createSkills () {
        let str = ''
        manifest.skills.forEach(skill => {
            const failures = skill.tests.filter(test => test.status === 'failed').length
            const skips = skill.tests.filter(test => test.status === 'skipped').length
            str += `  <testsuite name="${formatStrXml(skill.name)}" tests="${skill.tests.length}" errors="0" failures="${failures}" skip="${skips}">\n`
            skill.tests.forEach(test => {
                if (test.status === 'skipped' || test.status === 'failed')
                    str += `    <testcase classname="${formatStrXml(skill.name)}" name="${formatStrXml(test.name)}" time="0">\n`
                else
                    str += `    <testcase classname="${formatStrXml(skill.name)}" name="${formatStrXml(test.name)}" time="0" />\n`
                if (test.status === 'skipped' || test.status === 'failed') {
                    str += `      <${test.status == 'failed' ? "failure" : "skipped"} message="${formatStrXml(test.message)}"></${test.status == 'failed' ? "failure" : "skipped"}>\n`
                    str += `    </testcase>\n`
                }
            })
            str += `  </testsuite>\n`
        })
        return str
    }
    return `<testsuites>
${createSkills()}</testsuites>`
}

function saveReport() {
    const xml = createXml()
    fs.writeFileSync('tests_report.xml', xml)
    fs.writeFileSync('tests_report.json', JSON.stringify(manifest))
}
// SETUP
function setup () {
    manifest.skills.forEach(skill => {
        skill.tests.forEach(test => {
            test.status = 'skipped'
            test.message = 'Build failed'
        })
    })
    saveReport()
    console.log("Setup completed")
}
// BUILD
function build() {
    let succeed = true
    for (let i = 0; i < manifest['build-commands'].length && succeed; i++) {
        const command = manifest['build-commands'][i]
        try {
            console.log(command)
            const process = execSync(command, { timeout: 15000 })
            console.log(process.toString("utf8"));
        }
        catch (e) {
            succeed = false
        }
    }
    manifest.skills.forEach(skill => {
        skill.tests.forEach(test => {
            test.status = succeed ? 'skipped' : 'failed'
            test.message = succeed ? '' : 'Build failed'
        })
    })
    saveReport()
    console.log(`\nBuild completed with status : ${succeed ? "succeed" : "failed"}`)
    process.exit(succeed ? 0 : 1)
}

// TESTS SUITE RUNNER
function tests() {
    manifest.skills.forEach(skill => {
        skill.tests.forEach(test => {
            try {
                console.log(skill.name + '-' + test.name)
                console.log(test.command)
                const process = execSync(test.command)
                const output = process.toString("utf8")
                if (test.expected != output) {
                    test.status = 'failed'
                    test.message = `Got: "${output}"\nBut expected: "${test.expected}"`
                }
                else
                    test.status = 'succeed'
            }
            catch (e) {
                test.status = 'failed'
                test.message = 'An error occured in Jenkins. Please contact the instance administrator.'
            }
        })
    })
    saveReport()
}


if (!process || !process.argv) {
    console.error("Unable to read argv")
    process.exitCode = 1
    return
}

let validArg = false
process.argv.forEach(arg => {
    switch (arg) {
        case "--setup":
            validArg = true
            setup()
            break
        case "--build":
            validArg = true
            build()
            break
        case "--tests":
            validArg = true
            tests()
            break
    }
})
if (!validArg) {
    console.error("Invalid or missing argument.\nValid arguments: --setup, --build, --tests")
    process.exitCode = 1
}
