const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const { maxDifferenceLeaderboard, maxChallengeNew } = require('../config.json');

const lb = require('../leaderboard');

module.exports = {
    name: 'challenge',
    description: 'Challenge a user.',
    guildOnly: true,
    args: true,
    delete: true,
    aliases: ['1v1', 'vs', 'fight'],
    usage: '[channel] <user> [reason]',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const channel = reader.optionalReadLeaderboard();

        if (channel == null)
            return message.reply(
                'you did not include the channel the leaderboard that you want to challenge a person in.' +
                    ' To use this correctly, please specify a channel. For example, you may use it by typing `!challenge #just-fight @ReversedBot`.'
            );

        if (lb.leaderboards[channel] == null)
            return message.reply(
                `the channel you provided, ${channel} is not a leaderboard channel.`
            );

        const leaderboard = lb.leaderboards[channel];

        const challenger = message.author;

        const defender = reader.readUser();

        if (defender == null)
            return message.reply(
                'you did not provide a user by ping. Perhaps you meant to ping the user, or you are not using the command correctly?'
            );

        if (defender.id == challenger.id)
            return message.reply('you can not challenge yourself.');

        let reason = reader.readUntilEmpty() || '';

        const defenderLocation = leaderboard.indexOf(defender.id);

        const challengerLocation = leaderboard.indexOf(challenger.id);

        if (challengerLocation == -1) {
            if (
                defenderLocation != -1 &&
                defenderLocation < leaderboard.length - maxChallengeNew
            )
                return message.reply(
                    `the user that you challenged (${defender}) is too high up on the leaderboard for you to be able to challenge them.`
                );
        } else {
            if (defenderLocation == -1 || defenderLocation > challengerLocation)
                return message.reply(
                    `the user that you challenged (${defender}) is below you on the leaderboard, so you can't challenge them.`
                );
            else if (
                defenderLocation <
                challengerLocation - maxDifferenceLeaderboard
            )
                return message.reply(
                    `the user that you challenged (${defender}) is too high up on the leaderboard for you to be able to challenge them.`
                );
        }

        backupLeaderboard(lb, message);

        const challenges = lb.challenges;

        const defends = lb.defends;

        const time = new Date().getTime();

        if (!Object.prototype.hasOwnProperty.call(challenges, defender.id)) {
            challenges[defender.id] = [];
        }

        if (!Object.prototype.hasOwnProperty.call(defends, challenger.id)) {
            defends[challenger.id] = [];
        }

        const challenge = () => [
            time,
            `${channel}`,
            challenger.id,
            defender.id,
            challengerLocation,
            defenderLocation,
            reason
        ];

        challenges[defender.id].push(challenge());

        defends[challenger.id].push(challenge());

        message.channel.send(
            `${message.author} has successfully challenged ${defender} in ${channel}!`
        );

        writeLeaderboard();
    }
};
