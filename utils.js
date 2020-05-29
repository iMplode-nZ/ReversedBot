const lb = require('./leaderboard');

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

function renderLeaderboard(channel, players) {
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

function backupLeaderboard(msg) {
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

function writeLeaderboard() {
    const fs = require('fs');
    fs.writeFile('./leaderboard.json', JSON.stringify(lb), err => {
        if (err) throw err;
        console.log('Leaderboard Updated.');
    });
}

function createReader(message, args, client) {
    return {
        readUser() {
            if (args.length == 0) return;
            const user = getUserFromMention(args[0], client);
            if (user != null) {
                args.shift();
                return user;
            }
        },
        readChannel() {
            if (args.length == 0) return;
            const channel = getChannelFromId(args[0], message.guild);
            if (channel != null) {
                args.shift();
                return channel;
            }
        },
        readText() {
            return args.shift();
        },
        readInt() {
            const at = args[0] && parseInt(args.shift());
            return isNaN(at) ? null : at;
        }
    };
}

function createLeaderboardReader(message, args, client) {
    const reader = createReader(message, args, client);
    reader.readLeaderboard = function(err = true) {
        const leaderboard = this.readChannel();
        if (leaderboard == null) {
            if (err)
                message.reply(
                    'Invalid leaderboard. Perhaps the leaderboard is not a channel, or it is mistyped?'
                );
            return;
        }
        if (leaderboard.type != 'text') {
            if (err)
                message.reply('Leaderboard channel is not a text channel.');
            return;
        }
        return leaderboard;
    };
    reader.optionalReadLeaderboard = function() {
        const leaderboard = this.readLeaderboard(false);
        if (leaderboard == null) {
            if (message.channel.type == 'text') return message.channel;
            else {
                message.reply('Invalid channel');
                return;
            }
        }
        return leaderboard;
    };
    return reader;
}

module.exports = {
    getEmoji,
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    getChannelFromId,
    getUserFromMention,
    createReader,
    createLeaderboardReader
};
