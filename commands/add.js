const {
	getUserFromMention,
	getChannelFromId,
	parseLeaderboard,
	renderLeaderboard,
	writeLeaderboard,
	backupLeaderboard
} = require('../utils');

module.exports = {
	name: 'add',
	description: 'Moves or adds a player.',
	guildOnly: true,
	usage: '<channel> <player> [index]',
	execute(message, args, client) {
		const last = require('../leaderboard.json');

		const leaderboardChannel = parseLeaderboard(message, args[0]);

		if (leaderboardChannel == null) return;

		const leaderboard = last.leaderboards[args[0]];

		const i = args[2] && parseInt(args[2]);

		const user = getUserFromMention(args[1], client);

		if (user == null) return message.reply('Invalid user.');

		const userLocation = leaderboard.indexOf(user.id);

		backupLeaderboard(last, message);

		if (i == null || isNaN(i)) {
			if (userLocation == -1) {
				leaderboard.push(user.id);
			} else {
				return message.reply(
					'User already in leaderboard. Perhaps you meant to use the third argument?'
				);
			}
		} else {
			if (userLocation == -1) {
				leaderboard.splice(i - 1, 0, user.id);
			} else {
				if (userLocation >= i) {
					leaderboard.splice(userLocation, 1);
					leaderboard.splice(i - 1, 0, user.id);
				} else {
					leaderboard.splice(userLocation, 1);
					leaderboard.splice(i - 1, 0, user.id);
				}
			}
		}

		renderLeaderboard(leaderboardChannel, leaderboard, client);

		writeLeaderboard(last);
	}
};
