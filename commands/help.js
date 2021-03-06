const { createReader } = require('../utils');

const { prefix } = require('../config.json');

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: '[command name]',
    aliases: ['commands'],
    execute(message, args, client) {
        const data = [];
        const { commands } = message.client;

        const reader = createReader(message, args, client);

        if (!args) {
            data.push("Here's a list of all my commands:");
            data.push(
                commands
                    .filter(x => !x.hidden)
                    .map(command => command.name)
                    .join(', ')
            );
            data.push(
                `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
            );

            return message.channel.send(data, { split: true });
        }
        const name = reader.readText().toLowerCase();
        const command =
            commands.get(name) ||
            commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command || command.hidden) {
            return message.reply("that's not a valid command!");
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases)
            data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description)
            data.push(`**Description:** ${command.description}`);
        if (command.usage)
            data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        message.channel.send(data, { split: true });
    }
};
