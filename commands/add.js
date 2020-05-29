const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const lb = require('../leaderboard.json');

module.exports = {
    name: 'add',
    description: 'Moves or adds a player.',
    guildOnly: true,
    adminOnly: 'mod',
    args: true,
    delete: true,
    aliases: ['insert'],
    usage: '[channel] <player> [index]',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = lb.leaderboards[leaderboardChannel];

        const user = reader.readUser();

        const i = reader.readInt();

        if (user == null) return message.reply('Invalid user.');

        const userLocation = leaderboard.indexOf(user.id);

        backupLeaderboard(message);

        if (i == null) {
            if (userLocation == -1) {
                leaderboard.push(user.id);
            } else {
                return message.reply(
                    'User already in leaderboard. Perhaps you meant to use the third argument?'
                );
            }
        } else {
            if (userLocation == -1) {
                leaderboard.splice(i - 1, 0, user.id);
            } else {
                if (userLocation >= i) {
                    leaderboard.splice(userLocation, 1);
                    leaderboard.splice(i - 1, 0, user.id);
                } else {
                    leaderboard.splice(userLocation, 1);
                    leaderboard.splice(i - 1, 0, user.id);
                }
            }
        }

        renderLeaderboard(leaderboardChannel, leaderboard);

        writeLeaderboard();
    }
};
