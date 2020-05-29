const {
    writeLeaderboard,
    backupLeaderboard,
    getChannelFromId
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
    execute(message) {
        if (message.author.id != require('../config.json').owner)
            return message.reply('is not the owner of this bot.');

        backupLeaderboard(lb, message);

        for (const x in lb.leaderboards) {
            if (Object.prototype.hasOwnProperty.call(lb.leaderboards, x)) {
                const leaderboardChannel = getChannelFromId(x, message.guild);
                if (leaderboardChannel == null) delete lb.leaderboards[x];
            }
        }

        writeLeaderboard(lb);
    }
};
