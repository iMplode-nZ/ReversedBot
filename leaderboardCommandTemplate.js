const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

module.exports = {
    name: 'template',
    description: 'Does nothing.',
    guildOnly: true,
    adminOnly: true,
    args: true,
    aliases: [
        /*=== INSERT ALIASES HERE ===*/
    ],
    usage: '[channel]',
    execute(message, args, client) {
        const last = require('../leaderboard.json');

        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = last.leaderboards[leaderboardChannel];

        backupLeaderboard(last, message);

        /* ==============================================
           ================ DO SOMETHING ================
           ============================================== */

        renderLeaderboard(leaderboardChannel, leaderboard, client);

        writeLeaderboard(last);
    }
};
