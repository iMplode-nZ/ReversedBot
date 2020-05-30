const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const { reportChannel } = require('../config.json');

const lb = require('../leaderboard');

module.exports = {
    name: 'adminreject',
    description: 'Rejects any challenge.',
    guildOnly: true,
    args: true,
    delete: true,
    admin: true,
    aliases: ['adminignore'],
    usage: '[channel] <challenger> <defender>',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = lb.leaderboards[leaderboardChannel];

        if (leaderboard == null) return message.reply('Invalid leaderboard.');

        const user = reader.readUser();

        const other = reader.readUser();

        if (user == null || other == null)
            return message.reply('Invalid users.');

        backupLeaderboard(lb, message);

        let defender = other;

        let challengeIndex = -1;
        if (lb.challenges[defender.id] != null)
            challengeIndex = lb.challenges[defender.id].findIndex(
                elem => elem[2] == user.id
            );

        if (challengeIndex == -1)
            return message.reply(
                `we could not find a challenge where the challenger is ${user} and the defender is ${other}.`
            );

        const challenge = lb.challenges[defender.id][challengeIndex];

        const challenger = defender == other ? user : other;

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
