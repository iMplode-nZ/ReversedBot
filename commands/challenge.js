const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const lb = require('../leaderboard');

module.exports = {
    name: 'challenge',
    description: 'Challenge a user.',
    guildOnly: true,
    args: true,
    delete: true,
    aliases: ['1v1', 'vs', 'fight'],
    usage: '[channel] ',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const channel = reader.optionalReadLeaderboard();

        if (channel == null)
            return message.reply(
                'you did not include the channel the leaderboard that you want to challenge a person in.' +
                    ' To use this correctly, please specify a channel. For example, you may use it by typing `!challenge #just-fight @ReversedBot`.'
            );

        const challenger = message.author;

        const defender = reader.readUser();

        if (defender == null)
            return message.reply(
                'you did not provide a user by ping. Perhaps you meant to ping the user, or you are not using the command correctly?'
            );

        if (defender.id == challenger.id)
            return message.reply('you can not challenge yourself.');

        backupLeaderboard(lb, message);

        const challenges = lb.challenges;

        if (!Object.prototype.hasOwnProperty.call(challenges, defender.id)) {
            challenges[defender.id] = [];
        }

        const challenge = [`${channel}`, challenger.id];

        challenges[defender.id].push(challenge);

        message.channel.send(
            `${message.author} has successfully challenged ${defender} in ${channel}!`
        );

        writeLeaderboard(lb);
    }
};
