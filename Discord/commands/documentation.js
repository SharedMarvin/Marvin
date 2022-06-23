const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('documentation')
    .setDescription("Get the bot's documentation."),
    
    execute: async (interaction) => {
        await interaction.reply({ content: `Read the documentation here : ${process.env.DOCUMENTATION_URL}`, ephemeral: true })
    }
}
