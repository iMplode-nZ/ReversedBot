const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const lb = require('../leaderboard');

module.exports = {
    name: 'delete',
    description: 'Deletes a player.',
    guildOnly: true,
    adminOnly: true,
    args: true,
    delete: true,
    aliases: ['remove'],
    usage: '[channel] <player>',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const user = reader.readUser();

        const leaderboard = lb.leaderboards[leaderboardChannel];

        if (user == null) return message.reply('Invalid user.');

        const userLocation = leaderboard.indexOf(user.id);

        backupLeaderboard(message);

        if (userLocation == -1)
            return message.reply('User not in leaderboard, can not delete.');

        leaderboard.splice(userLocation, 1);

        renderLeaderboard(leaderboardChannel, leaderboard);

        writeLeaderboard();
    }
};
