const { createReader } = require('../utils');

module.exports = {
    name: 'repeat',
    description: '',
    guildOnly: true,
    adminOnly: 'owner',
    args: true,
    delete: true,
    hidden: true,
    aliases: [],
    usage: '<msg> <number> [timeout]',
    execute(message, args, client) {
        const reader = createReader(message, args, client);
        const txt = reader.readText();

        const number = reader.readInt();

        if (number == null) return message.reply('Invalid number of repeats.');

        let delay = reader.readInt();

        if (delay == null) delay = 0;

        setTimeout(() => {
            for (let i = 0; i < number; i++) {
                message.channel.send(txt);
            }
        }, delay);
    }
};
