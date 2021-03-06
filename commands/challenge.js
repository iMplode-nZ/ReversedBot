const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const lb = require('../leaderboard');

const Leaderboard = require('../Scoring');

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

        const leaderboard = Leaderboard(channel);

        if (leaderboard == null) return;

        const challenger = message.author;

        const defender = reader.readUser();

        if (defender == null)
            return message.reply(
                'you did not provide a user by ping. Perhaps you meant to ping the user, or you are not using the command correctly?'
            );

        if (defender.id == challenger.id)
            return message.reply('you can not challenge yourself.');

        let reason = reader.readUntilEmpty() || '';

        const match = leaderboard.canMatch(message.author, defender);

        if (match != '') return message.reply(match);

        backupLeaderboard(message);

        const challenges = lb.challenges;

        const defends = lb.defends;

        const time = Date.now();

        if (!Object.prototype.hasOwnProperty.call(challenges, defender.id)) {
            challenges[defender.id] = [];
        }

        if (!Object.prototype.hasOwnProperty.call(defends, challenger.id)) {
            defends[challenger.id] = [];
        }

        for (let x of defends[challenger.id]) {
            if (x[3] == defender.id && x[1] == channel.id)
                return message.reply(
                    `you have already challenged ${defender}; you can not challenge a person twice before one challenge is resolved.`
                );
        }
        if (defends[defender.id])
            for (let x of defends[defender.id]) {
                if (x[3] == challenger.id && x[1] == channel.id)
                    return message.reply(
                        `you have been challenged by ${defender}; you can not challenge a person if they challenged you and you have not accepted yet.`
                    );
            }

        const challenge = () => [
            time,
            `${channel}`,
            challenger.id,
            defender.id,
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
