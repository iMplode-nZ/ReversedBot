const fs = require('fs');

const { prefix, token } = require('./config.json');
const Discord = require('discord.js');
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

console.log(prefix);

function messageHandler(message) {
	console.log(message.content);
	if (message.content.startsWith(prefix)) {
		const args = message.content
			.slice(prefix.length)
			.split(/(?<!\\) +/)
			.map(a => {
				console.log(a);
				return a.replace(/\\ /g, ' ');
			});
		const commandName = args.shift().toLowerCase();
		console.log('Args: ' + args);
		console.log('Command: ' + commandName);
		const command =
			client.commands.get(commandName) ||
			client.commands.find(
				cmd => cmd.aliases && cmd.aliases.includes(commandName)
			);
		if (!command) return;

		if (command.guildOnly && message.channel.type !== 'text') {
			return message.reply("I can't execute that command inside DMs!");
		}

		if (command.args && !args.length) {
			let reply = `You didn't provide any arguments, ${message.author}!`;

			if (command.usage) {
				reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
			}

			return message.channel.send(reply);
			return message.channel.send(
				`You didn't provide any arguments, ${message.author}!`
			);
		}
		try {
			command.execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
	}
}
