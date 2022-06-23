const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const instance = require('../utils').instance

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription("List all your jobs hosted on jenkins."),

    execute: async (interaction) => {
        const embed = new MessageEmbed()
            .setTitle("List of your jobs")
            .setDescription("Requesting Jenkins...")
        instance.get("job/Public/api/json?tree=jobs[name,description,builds[number,result]{0,1}]")
            .then(res => {
                const jobs = res.data.jobs.filter(job => {
                    return (job.builds.length > 0 && job.description == interaction.user.id.toString())
                })
                if (jobs.length > 0) {
                    embed.setDescription(`You have ${jobs.length} job${jobs.length > 1 ? "s" : ""} hosted on Jenkins :`)
                    embed.fields = []
                    jobs.forEach(job => {
                        embed.addField(`${job.name}`, `X% on the last build. (X/X)`, false)
                    })
                    console.log(jobs.builds)
                }
                else {
                    embed.setDescription("You don't have any jobs hosted on jenkins.")
                }
                interaction.reply({ embeds: [embed], ephemeral: true })
            })
            .catch(err => {
                console.error(err)
                embed.description = ":warning: Unable to request Jenkins. You can try /status to see what's going on."
                interaction.reply({ embeds: [embed], ephemeral: true })
            })
    }
}
