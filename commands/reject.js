const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader,
    discardOldChallenges
} = require('../utils');

const { reportChannel } = require('../config.json');

const lb = require('../leaderboard');

module.exports = {
    name: 'reject',
    description: 'Rejects a challenge.',
    guildOnly: true,
    args: true,
    delete: true,
    aliases: ['ignore'],
    usage: '[channel] <user>',
    execute(message, args, client) {
        discardOldChallenges(message.guild);

        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const other = reader.readUser();

        backupLeaderboard(message);

        let defender = other;

        let challengeIndex = -1;
        if (lb.challenges[defender.id] != null)
            challengeIndex = lb.challenges[defender.id].findIndex(
                elem => elem[2] == message.author.id
            );

        if (challengeIndex == -1)
            return message.reply(
                `we could not find a challenge where the challenger is ${message.author} and the defender is ${other}.`
            );

        const challenge = lb.challenges[defender.id][challengeIndex];

        const challenger = defender == other ? message.author : other;

        backupLeaderboard(lb, message);

        // Delete Challenge

        lb.challenges[defender.id].splice(challengeIndex, 1);

        lb.defends[challenger.id] = lb.defends[challenger.id].filter(
            a => !a.every((x, i) => x == challenge[i])
        );

        message.channel.send('Challenge successfully rejected.');

        message.guild.channels.cache
            .get(reportChannel)
            .send(
                `Rejected: ${leaderboardChannel} ${challenge[0]} ${challenger} ${defender} ${challenge[4]}`
            );

        writeLeaderboard();
    }
};
