const {
	getUserFromMention,
	getChannelFromId,
	parseLeaderboard,
	renderLeaderboard,
	writeLeaderboard,
	backupLeaderboard
} = require('../utils');

module.exports = {
	name: 'delete',
	description: 'Deletes a player.',
	guildOnly: true,
	usage: '<channel> <player>',
	execute(message, args, client) {
		const last = require('../leaderboard.json');

		const leaderboardChannel = parseLeaderboard(message, args[0]);

		if (leaderboardChannel == null) return;

		const leaderboard = last.leaderboards[args[0]];

		const user = getUserFromMention(args[1], client);

		if (user == null) return message.reply('Invalid user.');

		const userLocation = leaderboard.indexOf(user.id);

		backupLeaderboard(last);

		if (userLocation == -1)
			return message.reply('User not in leaderboard, can not delete.');

		leaderboard.splice(userLocation, 1);

		renderLeaderboard(leaderboardChannel, leaderboard, client);

		writeLeaderboard(last);
	}
};
