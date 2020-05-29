const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

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
