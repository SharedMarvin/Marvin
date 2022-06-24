const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    async handle(Module, Project, Snowflake, payload, DiscordClient, commit_hash, commit_message, commit_time) {
        const user = await DiscordClient.users.fetch(Snowflake)
        if (!user)
            throw new Error('Unable to find your Discord account.')
        try {
            let totalTests = 0
            let totalPassed = 0
            payload.skills.forEach(skill => {
                totalTests += skill.tests.length
                skill.tests.forEach(test => {
                    if (test.status == 'succeed')
                        totalPassed++
                })
            })
            const totalPercentage = Math.round((totalPassed / totalTests) * 100)
            const embed = new MessageEmbed()
                .setTitle(`[${Module}] ${Project}`)
                .setDescription(`You passed ${totalPassed}/${totalTests} tests.\n${totalPercentage}%`)
                .setTimestamp(new Date(commit_time.replace(/ /g, '+')))
                .setFooter({ text: `commit: "${commit_message}"\nhash: ${commit_hash}` })
                .setColor(totalPercentage > 75 ? '#62c22f' : totalPercentage > 25 ? '#ed822f' : '#f03737')
            payload.skills.forEach(skill => {
                let nbTests = skill.tests.length
                let nbPassed = 0
                let skillReport = ''
                skill.tests.forEach(test => {
                    switch (test.status) {
                        case 'succeed':
                            skillReport += `🟢 ${test.name} - PASSED\n`
                            nbPassed++
                            break
                        case 'failed':
                            skillReport += `🔴 ${test.name} - FAILED\n${test.message ? `${test.message}\n` : ''}`
                            break
                        default:
                            skillReport += `🔘 ${test.name} - SKIPPED\n${test.message ? `${test.message}\n` : ''}`
                    }
                })
                embed.addField(`${skill.name} - ${Math.round((nbPassed / nbTests) * 100)}%`, skillReport)
            })
            await DiscordClient.guilds.fetch(process.env.DISCORD_SERVERID).then(async guild => {
                await guild.channels.fetch().then(async channels => {
                    const everyoneRole = (await guild.roles.fetch()).filter(role => role.name == '@everyone').first()
                    let category = channels.filter(channel => (channel.type == 'GUILD_CATEGORY' && channel.name.includes(Snowflake))).first()
                    if (!category) {
                        await guild.channels.create(`Tests Reports - ${Snowflake}`, { type: 'GUILD_CATEGORY', position: 42 }).then(async newCategory => {
                            category = newCategory
                            await newCategory.permissionOverwrites.set([
                                { type: 'role', id: everyoneRole.id, deny: [Permissions.FLAGS.VIEW_CHANNEL] },
                                { type: 'member', id: user.id, allow: [Permissions.FLAGS.VIEW_CHANNEL] },
                            ], 'Changed permissions for the category.')
                        })
                    }
                    let channel = channels.filter(channel => (channel.type == 'GUILD_TEXT' && channel.name == Project.toLowerCase() && channel.parentId == category.id)).first()
                    if (!channel) {
                        await guild.channels.create(Project.toLowerCase(), { type: 'GUILD_TEXT', topic: `[${Module}] ${Project}`, parent: category, position: 0 }).then(async newChannel => {
                            channel = newChannel
                            await newChannel.permissionOverwrites.set([
                                { type: 'role', id: everyoneRole.id, deny: [Permissions.FLAGS.VIEW_CHANNEL] },
                                { type: 'member', id: user.id, allow: [Permissions.FLAGS.VIEW_CHANNEL] },
                            ], 'Changed permissions for the channel.')
                        })
                    }
                    await channel.send({embeds: [embed]})
                })
            })
        }
        catch (error) {
            console.error(error)
            throw new Error("Unable to publish tests report on Discord.")
        }
        return true
    }
}
