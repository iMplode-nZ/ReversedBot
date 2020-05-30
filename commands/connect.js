const { createReader } = require('../utils');

const connect = require('../connect');

module.exports = {
    name: 'connect',
    description: '???',
    guildOnly: true,
    adminOnly: 'owner',
    args: true,
    delete: true,
    hidden: true,
    aliases: [],
    usage: '<user> <wh <user> <channel> <nickname (y/n)> [switch]|bot>',
    execute(message, args, client) {
        const reader = createReader(message, args, client);

        const user = reader.readUser();

        const type = reader.readText();

        if (type == 'wh') {
            const other = reader.readUser();
            if (other == null) return;
            const channel = reader.readChannel();
            if (channel == null) return;
            const nickname = reader.readText() == 'y';
            const shouldSwitch = reader.readText() == null;
            connect.start(user);
            connect.webhook(other, channel, nickname, shouldSwitch);
        } else if (type == 'bot') {
            connect.start(user);
            connect.bot();
        }
    }
};
