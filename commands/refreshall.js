const lb = require('../leaderboard');

const Leaderboard = require('../Scoring');
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
                const channel = message.guild.channels.cache.get(x);
                if (channel == null) continue;
                const leaderboard = Leaderboard(channel);
                if (leaderboard == null) continue;
                leaderboard.render();
            }
        }
    }
};
