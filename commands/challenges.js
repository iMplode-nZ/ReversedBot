const Discord = require('discord.js');

const { createReader, generateChallenge } = require('../utils');

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

        if (lb.challenges[user.id] != null)
            for (const a of lb.challenges[user.id]) generateChallenge(a, embed);

        if (lb.defends[user.id] != null)
            for (const a of lb.defends[user.id]) generateChallenge(a, embed);

        message.channel
            .send(new Discord.MessageEmbed())
            .then(x => x.edit(embed));
    }
};
