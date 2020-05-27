const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	console.log(message.content);
	if (message.content === '!ping') {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Pong.');
	}
});



client.login('NzE1Mjg5NDYwNDIxNjg5NDA4.Xs7DkQ.0dJqefs5nod7k44TTFXVfIDeyHw');