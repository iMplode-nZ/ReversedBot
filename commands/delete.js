const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

module.exports = {
    name: 'delete',
    description: 'Deletes a player.',
    guildOnly: true,
    adminOnly: true,
    args: true,
    aliases: ['remove'],
    usage: '[channel] <player>',
    execute(message, args, client) {
        const last = require('../leaderboard.json');

        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const user = reader.readUser();

        const leaderboard = last.leaderboards[leaderboardChannel];

        if (user == null) return message.reply('Invalid user.');

        const userLocation = leaderboard.indexOf(user.id);

        backupLeaderboard(last, message);

        if (userLocation == -1)
            return message.reply('User not in leaderboard, can not delete.');

        leaderboard.splice(userLocation, 1);

        renderLeaderboard(leaderboardChannel, leaderboard, client);

        writeLeaderboard(last);
    }
};
