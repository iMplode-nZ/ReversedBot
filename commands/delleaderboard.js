const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const lb = require('../leaderboard');

module.exports = {
    name: 'delleaderboard',
    description: 'Deletes a leaderboard.',
    guildOnly: true,
    adminOnly: true,
    delete: true,
    aliases: ['deleteleaderboard'],
    usage: '[channel]',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        backupLeaderboard(lb, message);

        lb.leaderboards[leaderboardChannel] = undefined;

        writeLeaderboard();
    }
};
