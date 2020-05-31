const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader,
    discardOldChallenges
} = require('../utils');

const lb = require('../leaderboard');

module.exports = {
    name: 'accept',
    description: 'Accept a challenge (if you are the defender).',
    guildOnly: true,
    args: true,
    delete: true,
    aliases: [],
    usage: '[channel] <user>',
    execute(message, args, client) {
        discardOldChallenges(message.guild);

        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = lb.leaderboards[leaderboardChannel];

        if (leaderboard == null) return message.reply('Invalid leaderboard.');

        const challenger = reader.readUser();

        if (challenger == null) return message.reply('Invalid challenger.');

        const defender = message.author;

        if (!lb.challenges[defender.id] || !lb.defends[challenger.id])
            return message.reply(
                `Could not find a challenge including ${challenger} in ${leaderboardChannel}.`
            );

        const challenge = lb.challenges[defender.id].find(
            a => a[1] == leaderboardChannel.toString() && a[2] == challenger.id
        );

        const defend = lb.defends[challenger.id].find(
            a => a[1] == leaderboardChannel.toString() && a[3] == defender.id
        );

        if (challenge == undefined || defend == undefined)
            return message.reply(
                `Could not find a challenge including ${challenger} in ${leaderboardChannel}.`
            );

        backupLeaderboard(lb, message);

        challenge.push(true);
        defend.push(true);

        message.channel.send(
            `Challenge between ${challenger} and ${defender} successfully accepted.`
        );

        writeLeaderboard();
    }
};
