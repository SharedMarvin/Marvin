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
var app = express()
const webhookHandler = require('./webhook')
const reportHandler = require('./report')

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
    const { commit_hash } = req.query
    const payload = req.body

    try {
        await reportHandler.handle(Module, Project, Snowflake, commit_hash, payload, client)
    }
    catch (error) {
        res.status(400).json({ status: "KO", message: `${error}` })
        return false
    }
    res.status(200).json({ status: "OK", message: "Success." })
    return true
})

app.listen(80, () => {
    console.info(`Discord Express Server listening on port 80`)
})
