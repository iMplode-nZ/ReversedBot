const lb = require('./leaderboard');

const { renderLeaderboard } = require('./utils');

function Simple(channel, leaderboard) {
    return {
        getTop() {
            return leaderboard;
        },
        delete(user) {
            leaderboard.splice(leaderboard.indexOf(user.id), 1);
            renderLeaderboard(channel, this.getTop());
        },
        canMatch(u1, u2) {
            
        },
        resultMatch(u1, u2, w1, w2) {},
        add(user) {},
        type() {
            return 'simple';
        }
    };
}

function Ranking(channel, leaderboard) {
    const rankStart = 0;
    const rankMiddle = 2;
    const rankEnd = 4;
    const matchDifference = Math.log10(2);
    const maxGain = Math.log10(2);

    return {
        getTop() {},
        delete(user) {},
        canMatch(u1, u2) {
            const diff = u1 - u2;
            return Math.abs(diff) < matchDifference;
        },
        resultMatch(u1, u2, w1, w2) {},
        add(user) {
            leaderboard.rankings[user.id] = 2;
        },
        type() {
            return 'ranking';
        }
    };
}

function Leaderboard(channel) {
    const leaderboard = lb[channel];

    return (leaderboard.isRanking == null ? Simple : Ranking)(
        channel,
        leaderboard
    );
}

module.exports = Leaderboard;
