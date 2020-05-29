const {
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

module.exports = {
    name: 'setleaderboard',
    description:
        'Sets the people on a leaderboard. This action will delete the current leaderboard. Caution is advised.',
    guildOnly: true,
    adminOnly: true,
    args: true,
    usage: '[channel] <players>+',
    execute(message, args, client) {
        const last = require('../leaderboard.json');

        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const leaderboard = [];

        while (true) {
            const user = reader.readUser();
            if (user == null) {
                break;
            }
            leaderboard.push(user.id);
        }

        if (leaderboard.length == null)
            return message.reply('No users were provided.');

        renderLeaderboard(leaderboardChannel, leaderboard, client);

        console.log('Old Leaderboard:\n' + JSON.stringify(last));

        backupLeaderboard(last, message);

        last.leaderboards[leaderboardChannel] = leaderboard;

        writeLeaderboard(last);
    }
};
