const { prefex, token } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', messageHandler);

client.login(token);

function messageHandler(message) {
	console.log(message.content);
	if (message.content.startsWith(prefex)) {
		const args = message.content.slice(prefix.length).split(' ');
		const command = args.shift().toLowerCase();
		console.log('Args: ' + args);
		console.log('Command: ' + command);
		if (command === 'args-info') {
			if (!args.length) {
				return message.channel.send(
					`You didn't provide any arguments, ${message.author}!`
				);
			} else if (args[0] === 'foo') {
				return message.channel.send('bar');
			}

			message.channel.send(`First argument: ${args[0]}`);
		}
	}
}
