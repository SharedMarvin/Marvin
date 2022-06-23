const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('id')
        .setDescription("Get your Discord ID."),

    execute: async (interaction) => {
        await interaction.reply({ content: `Here's your Discord ID : \`${interaction.user.id}\`\n`, ephemeral: true })
    }
}
