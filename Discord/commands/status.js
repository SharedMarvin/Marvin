const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js');
const instance = require('../utils').instance

module.exports = {
    data: new SlashCommandBuilder()
    .setName('status')
    .setDescription("Get the status of the Jenkins instance."),
    
    execute: async (interaction) => {
        const embed = new MessageEmbed()
            .setTitle("Jenkins Status")
            .addField("Status", "Requesting Jenkins...", true)
            .addField("Used executors", "...", true)
            .addField("Response Time", "...", true)
        const start = Date.now()
        instance.get(`computer/api/json`)
            .then(res => {
                const duration = Date.now() - start;
                embed.fields.find(embed => { return embed.name === "Status" }).value = ":white_check_mark:"
                embed.fields.find(embed => { return embed.name === "Used executors" }).value = `${res.data.busyExecutors}/${res.data.totalExecutors}`
                embed.fields.find(embed => { return embed.name === "Response Time" }).value = `${duration}ms`
                interaction.reply({ embeds: [embed], ephemeral: true})
            })
            .catch(err => {
                const duration = Date.now() - start;
                console.error(err);
                embed.fields.find(embed => { return embed.name === "Status" }).value = ":warning:"
                embed.fields.find(embed => { return embed.name === "Used executors" }).value = ":warning:"
                embed.fields.find(embed => { return embed.name === "Response Time" }).value = `${duration}ms`
                interaction.reply({ embeds: [embed], ephemeral: true })
            })
    }
}
