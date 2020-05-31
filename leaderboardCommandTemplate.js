const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const Leaderboard = require('../Scoring');

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

        const leaderboard = Leaderboard(leaderboardChannel);

        if (leaderboard == null) return message.reply('Invalid leaderboard.');

        backupLeaderboard(message);

        /* ==============================================
           ================ DO SOMETHING ================
           ============================================== */

        writeLeaderboard();
    }
};
