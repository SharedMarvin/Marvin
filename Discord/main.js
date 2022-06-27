/*
 * DISCORD BOT
*/

const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { MessageEmbed } = require('discord.js')
const fs = require('node:fs')

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    console.info(`Loaded command: ${command.data.name}`)
    commands.push(command)
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.info('Started refreshing application (/) commands.')
        const commands_data = []
        commands.forEach(command => {
            commands_data.push(command.data.toJSON())
        })
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENTID),
            { body: commands_data },
        )
        console.info('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
})()

const { Client, Intents } = require('discord.js')
const client = new Client({
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    partials: [
        'CHANNEL', // Required to receive DMs
    ]
})

client.on('ready', () => {
    console.log(`Discord bot logged in as ${client.user.tag}`)
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    const command = commands.find(cmd => {
        return cmd.data.name === interaction.commandName
    })
    if (!command) return
    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: "An error occured while executing the command", ephemeral: true })
    }
})

client.login(process.env.DISCORD_TOKEN)

/*
 * EXPRESS SERVER
*/

var express = require('express')
var bodyParser = require('body-parser')
var cons = require('consolidate')
var app = express()
const webhookHandler = require('./webhook')
const reportHandler = require('./report')
const instance = require('./utils').instance

app.engine('html', cons.hogan);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.json())
app.set('json spaces', 4)

// GitHub webhook handler
app.post('/webhook/:Module/:Project/:Snowflake', async (req, res) => {
    const { Module, Project, Snowflake } = req.params
    const payload = req.body

    try {
        await webhookHandler.handle(Module, Project, Snowflake, req.headers["x-github-event"], payload, client)
    }
    catch (error) {
        res.status(400).json({ status: "KO", message: `${error}` })
        return false
    }
    res.status(200).json({ status: "OK", message: "Success." })
    return true
})

// Tests report handler
app.post('/report/:Module/:Project/:Snowflake', async (req, res) => {
    const { Module, Project, Snowflake } = req.params
    const { commit_hash, commit_message, commit_time, build_number } = req.query
    const payload = req.body

    try {
        await reportHandler.handle(Module, Project, Snowflake, payload, client, commit_hash, commit_message, commit_time, build_number)
    }
    catch (error) {
        res.status(400).json({ status: "KO", message: `${error}` })
        return false
    }
    res.status(200).json({ status: "OK", message: "Success." })
    return true
})

// View to check tests with details
app.get('/report/:Module/:Project/:Snowflake/:BuildNb', async (req, res) => {
    const { Module, Project, Snowflake, BuildNb } = req.params

    try {
        // Get tests report
        const job = (await instance.get(`/job/Tools/job/SendReport/${BuildNb}/api/json`)).data
        let parameters = {}
        job.actions.forEach(action => {
            if (action["_class"] == "hudson.model.ParametersAction") {
                action.parameters.forEach(obj => {
                    parameters[obj.name] = obj.value;
                })
            }
        })
        // Check if the current request is valid
        if (!Object.keys(parameters).length)
            throw "Bad request"
        if (parameters.DISCORD_SNOWFLAKE != Snowflake || parameters.MODULE != Module || parameters.PROJECT != Project)
            throw "Bad request"
        // Compute some data inside report
        const report = JSON.parse(parameters.REPORT_AS_JSON)
        let totalTests = 0
        let totalPassed = 0
        report.skills.forEach(skill => {
            totalTests += skill.tests.length
            skill.total = skill.tests.length
            skill.passed = 0
            skill.tests.forEach(test => {
                if (test.status == 'succeed') {
                    totalPassed++
                    skill.passed++
                    test.status = '✅'
                }
                else if (test.status == 'failed') {
                    test.status = '❌'
                }
                else if (test.status == 'skipped') {
                    test.status = '⚠️'
                }
                if (test.message) {
                    test.message = test.message.replace(/\n/g, '<br />')
                }
            })
            skill.percentage = Math.round(skill.passed / skill.total * 100)
            skill.color = skill.percentage >= 70 ? 'success' : skill.percentage >= 35 ? 'warning' : 'danger'
        })
        const dt = new Date(parameters.COMMIT_TIME)
        const totalPercentage = Math.round((totalPassed / totalTests) * 100)
        res.render('report', {
            Module: Module,
            Project: Project,
            CommitMessage: decodeURI(parameters.COMMIT_MESSAGE),
            CommitDate: `${(dt.getDate()).toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear().toString().padStart(4, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`,
            TotalPercentage: totalPercentage,
            TotalTests: totalTests,
            TotalPassed: totalPassed,
            TotalColor: totalPercentage >= 70 ? 'success' : totalPercentage > 35 ? 'warning' : 'danger',
            Skills: report.skills,
        })
        return true
    }
    catch (error) {
        res.status(400).json({ status: "KO", message: `Internal error` })
        return false
    }
})

app.listen(80, () => {
    console.info(`Discord Express Server listening on port 80`)
})
