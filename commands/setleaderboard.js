const {
    writeLeaderboard,
    backupLeaderboard,
    createLeaderboardReader
} = require('../utils');

const Leaderboard = require('../Scoring');

module.exports = {
    name: 'setleaderboard',
    description:
        'Sets the people on a leaderboard. This action will delete the current leaderboard. Caution is advised.',
    guildOnly: true,
    adminOnly: true,
    args: true,
    delete: true,
    usage: '[channel] <simple <players>+ | ranked>',
    execute(message, args, client) {
        const reader = createLeaderboardReader(message, args, client);

        const leaderboardChannel = reader.optionalReadLeaderboard();

        if (leaderboardChannel == null) return;

        const initType = reader.readText();

        backupLeaderboard(message);

        const leaderboard = Leaderboard(leaderboardChannel, initType);

        if (leaderboard == null) return;

        if (initType == 'simple') {
            while (true) {
                const user = reader.readUser();
                if (user == null) {
                    break;
                }
                leaderboard.add(user, -1);
            }
        }

        leaderboard.render();

        writeLeaderboard();
    }
};
