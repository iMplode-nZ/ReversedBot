function getUserFromMention(mention, client) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

function getChannelFromId(id, guild) {
	if (!id) return;

	if (id.startsWith('<#') && id.endsWith('>')) {
		id = id.slice(2, -1);

		if (id.startsWith('!')) {
			id = id.slice(1);
		}

		return guild.channels.cache.get(id);
	}
}

function getEmoji(name, client) {
	return client.emojis.cache.find(emoji => emoji.name === name);
}

function parseLeaderboard(message, location) {
	if (!message.member.hasPermission('ADMINISTRATOR')) {
		message.reply('is not an admin.');
		return;
	}

	if (location == null) {
		message.reply(
			'Invalid leaderboard. Perhaps it is mispelled or needs to be created (using createLeaderboard)?'
		);
		return;
	}

	const leaderboardChannel = getChannelFromId(location, message.guild);
	if (leaderboardChannel == null) {
		message.reply(
			'Invalid leaderboard. Perhaps the leaderboard is not a channel?'
		);
		return;
	}
	if (leaderboardChannel.type != 'text') {
		message.reply('Leaderboard channel is not a text channel.');
		return;
	}
	return leaderboardChannel;
}

function renderLeaderboard(channel, players, client) {
	channel.bulkDelete(100, true);

	let data = '';

	for (let i = 0; i < players.length; i++) {
		const user = players[i];
		const ping = ` <@${user}>`;
		let before = `\`${i + 1}\``;
		let after = '';
		if (i === 0) {
			after = '🥇';
		} else if (i === 1) {
			after = '🥈';
		} else if (i === 2) {
			after = '🥉';
		}
		data += `${before}${ping}${after}\n`;
	}

	channel.send(data, { split: true });
}

function backupLeaderboard(lb, msg) {
	const fs = require('fs');
	fs.appendFile(
		'./leaderboard-old.json',
		`${new Date()}: ${msg}\n${JSON.stringify(lb)}\n`,
		err => {
			if (err) throw err;
			console.log('Leaderboard Backuped');
		}
	);
}

function writeLeaderboard(lb) {
	const fs = require('fs');
	fs.writeFile('./leaderboard.json', JSON.stringify(lb), err => {
		if (err) throw err;
		console.log('Leaderboard Updated.');
	});
}

module.exports = {
	getUserFromMention,
	getChannelFromId,
	getEmoji,
	parseLeaderboard,
	renderLeaderboard,
	writeLeaderboard,
	backupLeaderboard
};
