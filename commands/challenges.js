const Discord = require('discord.js');

const { createReader } = require('../utils');

const lb = require('../leaderboard');

module.exports = {
    name: 'challenges',
    description: 'Shows the challenges for a player.',
    guildOnly: true,
    delete: true,
    aliases: ['userinfo', '1v1s'],
    usage: '[user]',
    execute(message, args, client) {
        const reader = createReader(message, args, client);
        let user = reader.readUser();
        if (user == null) user = message.author;

        const embed = new Discord.MessageEmbed()
            .setColor('#000000')
            .setTitle(`Challenges:`)
            .setDescription(
                `All challenges for ${user} that are currently pending.`
            )
            .setTimestamp();

        function generateChallenge(a) {
            embed.addField(
                '***Challenge:***',
                `\`Time Created:\` ${new Date(a[0])}
\`Leaderboard:\` ${a[1]}
\`Challenger:\` <@${a[2]}>
\`Defender:\` <@${a[3]}>`
            );
        }

        if (lb.challenges[user.id] != null)
            for (const a of lb.challenges[user.id]) generateChallenge(a);

        if (lb.defends[user.id] != null)
            for (const a of lb.defends[user.id]) generateChallenge(a);

        message.channel.send(embed);
    }
};
