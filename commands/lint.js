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
    adminOnly: 'owner',
    delete: true,
    hidden: true,
    aliases: [],
    usage: '[channel]',
    execute(message) {
        backupLeaderboard(message);

        for (const x in lb.leaderboards) {
            if (Object.prototype.hasOwnProperty.call(lb.leaderboards, x)) {
                const leaderboardChannel = getChannelFromId(x, message.guild);
                if (leaderboardChannel == null) delete lb.leaderboards[x];
            }
        }

        writeLeaderboard(lb);
    }
};
