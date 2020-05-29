const { renderLeaderboard, getChannelFromId } = require('../utils');

const lb = require('../leaderboard');
module.exports = {
    name: 'refreshall',
    description: 'Refreshes all leaderboards.',
    guildOnly: true,
    adminOnly: 'mod',
    delete: true,
    usage: '',
    execute(message) {
        for (const x in lb.leaderboards) {
            if (Object.prototype.hasOwnProperty.call(lb.leaderboards, x)) {
                const leaderboard = lb.leaderboards[x];
                const leaderboardChannel = getChannelFromId(x, message.guild);
                if (leaderboardChannel)
                    renderLeaderboard(leaderboardChannel, leaderboard);
            }
        }
    }
};
