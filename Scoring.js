const lb = require('./leaderboard');

const { renderLeaderboard } = require('./utils');

const Discord = require('discord.js');

const {
    maxLeaderboard,
    maxChallengeNew,
    maxDifferenceLeaderboard,
    minRank,
    defaultRank,
    maxRank,
    rankDifference,
    maxRankGain,
    forfeitAmount,
    averagingAmount
} = require('./config.json');

function Simple(channel, leaderboard) {
    return {
        getTop() {
            return leaderboard;
        },
        delete(user) {
            if (leaderboard.indexOf(user.id) == -1) return;
            leaderboard.splice(leaderboard.indexOf(user.id), 1);
        },
        canMatch(challenger, defender) {
            const defenderLocation = leaderboard.indexOf(defender.id);

            const challengerLocation = leaderboard.indexOf(challenger.id);

            if (challengerLocation == -1) {
                if (
                    defenderLocation != -1 &&
                    defenderLocation < leaderboard.length - maxChallengeNew
                )
                    return `the user that you challenged (${defender}) is too high up on the leaderboard for you to be able to challenge them.`;
            } else {
                if (
                    defenderLocation == -1 ||
                    defenderLocation > challengerLocation
                )
                    return `the user that you challenged (${defender}) is below you on the leaderboard, so you can't challenge them.`;
                else if (
                    defenderLocation <
                    challengerLocation - maxDifferenceLeaderboard
                )
                    return `the user that you challenged (${defender}) is too high up on the leaderboard for you to be able to challenge them.`;
            }
            return '';
        },
        resultMatch(winner, looser) {
            const winnerLocation = leaderboard.indexOf(winner.id);

            const looserLocation = leaderboard.indexOf(looser.id);

            if (winnerLocation == -1 && looserLocation == -1) {
                if (leaderboard.length < maxLeaderboard)
                    leaderboard.push(winner.id);
            } else if (winnerLocation == -1) {
                leaderboard.splice(looserLocation, 0, winner.id);
            } else if (
                looserLocation != -1 &&
                winnerLocation > looserLocation
            ) {
                leaderboard.splice(winnerLocation, 1);
                leaderboard.splice(looserLocation, 0, winner.id);
            }

            if (leaderboard.length > maxLeaderboard)
                leaderboard.length = maxLeaderboard;
        },
        add(user, index) {
            const userLocation = leaderboard.indexOf(user.id);

            if (index == null) return;

            if (index == -1) {
                if (userLocation == -1) {
                    leaderboard.push(user.id);
                } else {
                    return 'User already in leaderboard. Perhaps you meant to use the third argument?';
                }
            } else {
                if (userLocation == -1) {
                    leaderboard.splice(index - 1, 0, user.id);
                } else {
                    if (userLocation >= index) {
                        leaderboard.splice(userLocation, 1);
                        leaderboard.splice(index - 1, 0, user.id);
                    } else {
                        leaderboard.splice(userLocation, 1);
                        leaderboard.splice(index - 1, 0, user.id);
                    }
                }
            }

            return '';
        },
        type() {
            return 'simple';
        },
        render() {
            renderLeaderboard(channel, this.getTop());
        }
    };
}

function Ranking(channel, leaderboard) {
    const r = leaderboard.rankings;

    function normalize(x) {
        if (r[x] < minRank) r[x] = minRank;
        if (r[x] > maxRank) r[x] = maxRank;
    }

    return {
        getFullTop() {
            const res = Object.entries(r).sort((a, b) => b[1] - a[1]);
            if (res.length > maxLeaderboard) res.length = maxLeaderboard;
            return res;
        },
        getTop() {
            return this.getFullTop().map(a => a[0]);
        },
        delete(user) {
            if (r[user.id] == null) return;
            delete r[user.id];
            let numUsers = 0;
            let oldAvg = 0;
            for (let x in r) {
                if (Object.prototype.hasOwnProperty.call(r, x)) {
                    oldAvg += r[x];
                    numUsers++;
                }
            }
            oldAvg /= numUsers;
            oldAvg -= defaultRank;
            for (let x in r) {
                if (Object.prototype.hasOwnProperty.call(r, x)) {
                    r[x] += oldAvg;
                }
            }
        },
        canMatch(challenger, defender) {
            if (r[challenger.id] == null) this.add(challenger);
            if (r[defender.id] == null) this.add(defender);
            const diff = r[challenger.id] - r[defender.id];
            return diff > -rankDifference
                ? diff < rankDifference
                    ? ''
                    : `${defender}'s rating is too low for you to be able to challenge.`
                : `${defender} has a too high rating for you to be able to challenge.`;
        },
        resultMatch(winner, looser, challenger, defender, w1, w2, forfeit) {
            if (r[challenger.id] == null) this.add(challenger);
            if (r[defender.id] == null) this.add(defender);
            let winnerWins = w1;
            let looserWins = w2;
            if (winnerWins == 0) winnerWins = 0.5;
            if (looserWins == 0) looserWins = 0.5;

            if (forfeit) winnerWins += forfeitAmount;
            const winRatio = Math.log10(winnerWins) - Math.log10(looserWins);
            const expectedWinRatio = r[winner.id] - r[looser.id];
            let winDifference =
                (winRatio - expectedWinRatio) * (w1 + w2) * averagingAmount;
            if ((w1 + w2) * averagingAmount > 1)
                winDifference = winRatio - expectedWinRatio;
            if (winDifference > maxRankGain) winDifference = maxRankGain;
            if (winDifference < -maxRankGain) winDifference = maxRankGain;
            r[winner.id] += winDifference;
            r[looser.id] -= winDifference;
            normalize(winner.id);
            normalize(looser.id);
        },
        add(user, index) {
            if (index != null) {
                console.log('Invalid Adding Operation');
                return;
            }
            if (r[user.id] != null) return;
            r[user.id] = 2;
        },
        type() {
            return 'ranking';
        },
        render() {
            function renderLeaderboard(channel, players) {
                if (players == undefined) return;

                channel.bulkDelete(100, true);

                const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`***Leaderboard For ${channel.name}***`);

                let data = '';

                for (let i = 0; i < players.length; i++) {
                    const user = players[i];
                    const ping = ` <@${user[0]}> (${Math.pow(10, user[1])})`;
                    const pos = `\`${i + 1}:\``;
                    let placeMark = '';
                    if (i === 0) {
                        placeMark = '🥇';
                    } else if (i === 1) {
                        placeMark = '🥈';
                    } else if (i === 2) {
                        placeMark = '🥉';
                    }
                    data += `*** ${pos} *** ${ping} ${placeMark}\n`;
                }
                embed.setDescription(data);

                channel
                    .send(new Discord.MessageEmbed())
                    .then(x => x.edit(embed));
            }
            renderLeaderboard(channel, this.getFullTop());
        }
    };
}

function Leaderboard(channel, lbInitType = null) {
    let leaderboard = lb.leaderboards[channel];

    if (lbInitType == 'ranked') {
        lb.leaderboards[channel] = {
            isRanking: true,
            rankings: {}
        };
        leaderboard = lb.leaderboards[channel];
    } else if (lbInitType == 'simple') {
        lb.leaderboards[channel] = [];
        leaderboard = lb.leaderboards[channel];
    } else if (leaderboard == null) return leaderboard;

    return (leaderboard.isRanking == null ? Simple : Ranking)(
        channel,
        leaderboard
    );
}

module.exports = Leaderboard;
