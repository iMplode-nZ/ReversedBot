const { renderLeaderboard, getChannelFromId } = require('../utils');

module.exports = {
    name: 'refreshall',
    description: 'Refreshes all leaderboards.',
    guildOnly: true,
    adminOnly: true,
    usage: '',
    execute(message, args, client) {
        const last = require('../leaderboard.json');

        for (const x in last.leaderboards) {
            if (Object.prototype.hasOwnProperty.call(last.leaderboards, x)) {
                const leaderboard = last.leaderboards[x];
                const leaderboardChannel = getChannelFromId(x, message.guild);
                if (leaderboardChannel)
                    renderLeaderboard(leaderboardChannel, leaderboard, client);
            }
        }
    }
};
