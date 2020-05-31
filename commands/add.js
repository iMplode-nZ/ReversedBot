const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const Leaderboard = require('../Scoring');

module.exports = {
    name: 'add',
    description: 'Moves or adds a player.',
    guildOnly: true,
    adminOnly: 'mod',
    args: true,
    delete: true,
    aliases: ['insert'],
    usage: '[channel] <player> [index]',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = Leaderboard(leaderboardChannel);

        if (leaderboard == null) return message.reply('Invalid leaderboard.');

        const user = reader.readUser();

        if (user == null) return message.reply('Invalid user.');

        backupLeaderboard(message);

        if (leaderboard.type() == 'ranking') {
            leaderboard.add(user);
        } else {
            const i = reader.readInt();
            leaderboard.add(user, i == null ? -1 : i);
        }
        leaderboard.render();

        writeLeaderboard();
    }
};
