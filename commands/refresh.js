const { createLeaderboardReader } = require('../utils');

const Leaderboard = require('../Scoring');
module.exports = {
    name: 'refresh',
    description: 'Refreshes the current leaderboard.',
    guildOnly: true,
    adminOnly: 'mod',
    delete: true,
    usage: '[channel]',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = Leaderboard(leaderboardChannel);

        leaderboard.render();
    }
};
