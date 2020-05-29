const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const lb = require('../leaderboard');

module.exports = {
    name: 'lint',
    description: 'Clears useless cache elements.',
    guildOnly: true,
    adminOnly: true,
    delete: true,
    hidden: true,
    aliases: [
        /*=== INSERT ALIASES HERE ===*/
    ],
    usage: '[channel]',
    execute(message, args, client) {
        if (message.author.id != require('../config.json').owner)
            return message.reply('is not the owner of this bot.');

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
