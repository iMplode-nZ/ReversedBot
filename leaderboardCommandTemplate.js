const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const lb = require('../leaderboard');

module.exports = {
    name: 'template',
    description: 'Does nothing.',
    guildOnly: true,
    adminOnly: 'mod',
    args: true,
    delete: true,
    hidden: true,
    aliases: [
        /*=== INSERT ALIASES HERE ===*/
    ],
    usage: '[channel]',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = lb.leaderboards[leaderboardChannel];

        backupLeaderboard(lb, message);

        /* ==============================================
           ================ DO SOMETHING ================
           ============================================== */

        renderLeaderboard(leaderboardChannel, leaderboard, client);

        writeLeaderboard(lb);
    }
};
