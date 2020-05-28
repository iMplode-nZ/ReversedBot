const {
	getUserFromMention,
	getChannelFromId,
	parseLeaderboard,
	renderLeaderboard,
	writeLeaderboard,
	backupLeaderboard
} = require('../utils');

module.exports = {
	name: 'setleaderboard',
	description:
		'Sets the people on a leaderboard. This action will delete the current leaderboard. Caution is advised.',
	guildOnly: true,
	usage: '<channel> <players>+',
	execute(message, args, client) {
		const last = require('../leaderboard.json');

		const leaderboardChannel = parseLeaderboard(message, args[0]);

		if (leaderboardChannel == null) return;

		const leaderboard = [];

		for (let i = 1; i < args.length; i++) {
			const user = getUserFromMention(args[i], client);
			if (user == null) {
				return message.reply(
					`Invalid user at position ${i} in arguments.`
				);
			}
			leaderboard.push(user.id);
		}

		renderLeaderboard(leaderboardChannel, leaderboard, client);

		console.log('Old Leaderboard:\n' + JSON.stringify(last));

		backupLeaderboard(last);

		last.leaderboards[args[0]] = leaderboard;

		writeLeaderboard(last);
	}
};
