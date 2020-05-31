const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const Leaderboard = require('../Scoring');

module.exports = {
    name: 'delete',
    description: 'Deletes a player.',
    guildOnly: true,
    adminOnly: 'mod',
    args: true,
    delete: true,
    aliases: ['remove'],
    usage: '[channel] <player>',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const user = reader.readUser();

        const leaderboard = Leaderboard(leaderboardChannel);

        if (leaderboard == null) return message.reply('Invalid leaderboard.');

        if (user == null) return message.reply('Invalid user.');

        backupLeaderboard(message);

        leaderboard.delete(user);

        leaderboard.render();

        writeLeaderboard();
    }
};
