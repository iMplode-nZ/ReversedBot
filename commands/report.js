const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const {
    maxLeaderboard,
    reportChannel,
    challengeHistoryChannel
} = require('../config.json');

const Discord = require('discord.js');

const lb = require('../leaderboard');

module.exports = {
    name: 'report',
    description: 'Reports a win or loss.',
    guildOnly: true,
    args: true,
    aliases: ['result'],
    usage:
        '[channel] <winner> <looser> [forfeit] <winner-score> <looser-score> [text]',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = lb.leaderboards[leaderboardChannel];

        if (leaderboard == null) return message.reply('Invalid leaderboard.');

        const winner = reader.readUser();

        if (winner == null) return message.reply('Invalid arguments list.');

        const looser = reader.readUser();

        if (looser == null) return message.reply('Invalid arguments list.');

        const f = reader.readText();

        if (f == null) return message.reply('Invalid arguments list.');

        let forfeit = false;

        let winnerScore = null;
        let looserScore = null;

        const sm = /^(\d+)-(\d+)$/;

        const match = f.match(sm);

        if (match == null) {
            if (isNaN(parseInt(f))) {
                forfeit = true;
                const wl = reader.readText();
                const nfMatch = wl.match(sm);
                if (nfMatch == null) {
                    winnerScore = isNaN(parseInt(wl)) ? null : parseInt(wl);
                    looserScore = reader.readInt();
                } else {
                    winnerScore = parseInt(nfMatch[1]);
                    looserScore = parseInt(nfMatch[2]);
                }
            } else {
                winnerScore = parseInt(f);
                looserScore = reader.readInt();
            }
        } else {
            winnerScore = parseInt(match[1]);
            looserScore = parseInt(match[2]);
        }

        if (winnerScore == null)
            return message.reply('Invalid arguments list.');

        if (looserScore == null)
            return message.reply('Invalid arguments list.');

        let text = reader.readUntilEmpty();

        if (text == '')
            text = `${winner} defeats ${looser} ${winnerScore} - ${looserScore}${
                forfeit ? `, then ${looser} forfeits.` : '.'
            }`;

        let defender = winner;

        let challengeIndex = -1;
        if (lb.challenges[defender.id] != null)
            challengeIndex = lb.challenges[defender.id].findIndex(
                elem => elem[2] == looser.id
            );

        if (challengeIndex == -1 && lb.challenges[looser.id] != null) {
            defender = looser;
            challengeIndex = lb.challenges[defender.id].findIndex(
                elem => elem[2] == winner.id
            );
        }

        if (challengeIndex == -1)
            return message.reply(
                `we could not find a challenge including ${winner} and ${looser}.`
            );

        const challenge = lb.challenges[defender.id][challengeIndex];

        const challenger = defender == winner ? looser : winner;

        if (challenge[5] == null)
            return message.reply(
                `Challenge has not been accepted by ${defender}. Please contact ${defender} first.`
            );

        backupLeaderboard(lb, message);

        // Delete Challenge

        lb.challenges[defender.id].splice(challengeIndex, 1);

        lb.defends[challenger.id] = lb.defends[challenger.id].filter(
            a => !a.every((x, i) => x == challenge[i])
        );

        // Update Leaderboard

        const winnerLocation = leaderboard.indexOf(winner.id);

        const looserLocation = leaderboard.indexOf(looser.id);

        if (winnerLocation == -1 && looserLocation == -1) {
            if (leaderboard.length < maxLeaderboard)
                leaderboard.push(winner.id);
        } else if (winnerLocation == -1) {
            leaderboard.splice(looserLocation, 0, winner.id);
        } else if (looserLocation != -1 && winnerLocation > looserLocation) {
            leaderboard.splice(winnerLocation, 1);
            leaderboard.splice(looserLocation, 0, winner.id);
        }

        if (leaderboard.length > maxLeaderboard)
            leaderboard.length = maxLeaderboard;

        // Output Chat Message

        const ts = Date.now();

        const createResult = () => {
            function getName(x) {
                return message.guild.members.cache.get(x.id).displayName;
            }

            const embed = new Discord.MessageEmbed()
                .setColor('#1dcfc9')
                .setTimestamp(ts)
                .setTitle(
                    `Result for Challenge: ${getName(challenger)} vs ${getName(
                        defender
                    )} in ${leaderboardChannel.name}`
                )
                .setDescription(text);

            return embed;
        };

        message.guild.channels.cache
            .get(challengeHistoryChannel)
            .send(new Discord.MessageEmbed().setTitle('Loading...'))
            .then(x => setTimeout(() => x.edit(createResult()), 1000));

        message.guild.channels.cache
            .get(reportChannel)
            .send(
                'Loading...',
                new Discord.MessageEmbed().setTitle('Loading...')
            )
            .then(x =>
                setTimeout(
                    () =>
                        x.edit(
                            `||${leaderboardChannel} ${challenge[0]} ${challenger} ${defender} ${winner} ${looser} ${winnerScore} ${looserScore} ${forfeit}||`,
                            createResult()
                        ),
                    1000
                )
            );

        renderLeaderboard(leaderboardChannel, leaderboard, client);

        writeLeaderboard();
    }
};
