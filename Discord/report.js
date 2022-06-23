const { MessageEmbed } = require('discord.js');

module.exports = {
    async handle(Module, Project, Snowflake, commit_hash, payload, DiscordClient) {
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
            const totalPercentage = (totalPassed / totalTests) * 100
            const embed = new MessageEmbed()
                .setTitle(`[${Module}] ${Project}`)
                .setDescription(`You passed ${totalPassed}/${totalTests} tests.\n${totalPercentage}%`)
                .setTimestamp()
                .setFooter({ text: `Commit hash : ${commit_hash}` })
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
                embed.addField(`${skill.name} - ${(nbPassed / nbTests) * 100}%`, skillReport)
            })
            await user.send({
                embeds: [embed]
            })
        }
        catch (error) {
            throw new Error("Unable to contact your Discord account")
        }
        return true
    }
}
