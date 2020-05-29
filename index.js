const fs = require('fs');

const { prefix, token, owner } = require('./config.json');
const Discord = require('discord.js');
const { splitFirstWhitespace } = require('./utils');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs
    .readdirSync('./commands')
    .filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', messageHandler);

client.login(token);

function messageHandler(message) {
    if (message.content.startsWith(prefix)) {
        let args = splitFirstWhitespace(message.content);
        console.log(args);
        args[0] = args[0].slice(prefix.length);
        const commandName = args.shift().toLowerCase();
        args = args[0] ? args[0] : '';
        const command =
            client.commands.get(commandName) ||
            client.commands.find(
                cmd => cmd.aliases && cmd.aliases.includes(commandName)
            );
        if (!command) return;

        if (message.author.id === '529765788257615893')
            return message.channel.send(
                'No Commands for <@!529765788257615893>'
            );

        if (command.guildOnly && message.channel.type !== 'text')
            return message.reply("I can't execute that command inside DMs!");

        if (message.author.id != owner) {
            if (
                command.adminOnly &&
                !(command.adminOnly == 'mod'
                    ? message.member.hasPermission('MANAGE_MESSAGES')
                    : message.member.hasPermission('ADMINISTRATOR'))
            )
                return message.reply('is not an admin.');

            if (command.adminOnly == 'owner')
                return message.reply('is not the owner of this bot.');
        }

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
        }
        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }

        if (command.delete) message.delete();
    }
}
