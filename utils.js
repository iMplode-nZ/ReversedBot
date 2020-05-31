const lb = require('./leaderboard');
const Discord = require('discord.js');

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
    if (players == undefined) return;

    channel.bulkDelete(100, true);

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`***Leaderboard For ${channel.name}***`);

    let data = '';

    for (let i = 0; i < players.length; i++) {
        const user = players[i];
        const ping = ` <@${user}>`;
        const pos = `\`${i + 1}:\``;
        let placeMark = '';
        if (i === 0) {
            placeMark = '🥇';
        } else if (i === 1) {
            placeMark = '🥈';
        } else if (i === 2) {
            placeMark = '🥉';
        }
        data += `*** ${pos} *** ${ping} ${placeMark}\n`;
    }
    embed.setDescription(data);

    channel.send(new Discord.MessageEmbed()).then(x => x.edit(embed));
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

function splitFirstWhitespace(x) {
    const split = x.split(/\s+([^]+)/);
    if (split.length == 0) split.push('');
    if (split.length == 1) split.push('');
    return split;
}

function createReader(message, a, client) {
    let args = a;

    return {
        readUser() {
            if (args.length == 0) return;
            const split = splitFirstWhitespace(args);
            const user = getUserFromMention(split[0], client);
            if (user != null) {
                args = split[1];
                return user;
            } else {
                const ou = client.users.cache.get(split[0]);
                if (ou != null) {
                    args = split[1];
                    return ou;
                }
            }
        },
        readChannel() {
            if (args.length == 0) return;
            const split = splitFirstWhitespace(args);
            const channel = getChannelFromId(split[0], message.guild);
            if (channel != null) {
                args = split[1];
                return channel;
            }
        },
        readText() {
            if (args.length == 0) return;
            const split = splitFirstWhitespace(args);
            args = split[1];
            return split[0];
        },
        readInt() {
            if (args.length == 0) return;
            const at = parseInt(this.readText());
            return at == null || isNaN(at) ? null : at;
        },
        readUntilEmpty() {
            const x = args;
            args = '';
            return x;
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

function generateChallenge(a, embed) {
    embed.addField(
        `***Challenge${a[5] == null ? '' : ' (Accepted)'}:***`,
        `**\`Time Created:\`** ${new Date(a[0])}
**\`Leaderboard:\`** ${a[1]}
**\`Challenger:\`** <@${a[2]}>
**\`Defender:\`** <@${a[3]}>${
            a[4] ? `\n**\`Message from Challenger:\`** ${a[4]}` : ''
        }`
    );
}

function discardOldChallenges(guild) {
    const embed = new Discord.MessageEmbed()
        .setColor('#e8272b')
        .setTitle('Discarded Challenges:');

    const time = Date.now() - require('./config.json').maxChallengeActiveTime;
    for (const x in lb.defends) {
        if (Object.prototype.hasOwnProperty.call(lb.defends, x)) {
            lb.defends[x] = lb.defends[x].filter(a => {
                if (a[0] > time) {
                    return true;
                } else {
                    return generateChallenge(a, embed);
                }
            });
        }
    }
    for (const x in lb.challenges) {
        if (Object.prototype.hasOwnProperty.call(lb.challenges, x)) {
            lb.challenges[x] = lb.challenges[x].filter(a => {
                if (a[0] > time) {
                    return true;
                } else {
                    return generateChallenge(a, embed);
                }
            });
        }
    }
    guild.channels.cache
        .get(require('./config.json').reportChannel)
        .send(embed);
}

module.exports = {
    getEmoji,
    renderLeaderboard,
    writeLeaderboard,
    backupLeaderboard,
    getChannelFromId,
    getUserFromMention,
    createReader,
    createLeaderboardReader,
    generateChallenge,
    splitFirstWhitespace,
    discardOldChallenges
};
