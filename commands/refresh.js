const { renderLeaderboard, createLeaderboardReader } = require('../utils');

module.exports = {
    name: 'refresh',
    description: 'Refreshes the current leaderboard.',
    guildOnly: true,
    adminOnly: true,
    usage: '[channel]',
    execute(message, args, client) {
        const last = require('../leaderboard.json');

        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = last.leaderboards[leaderboardChannel];

        renderLeaderboard(leaderboardChannel, leaderboard, client);
    }
};
