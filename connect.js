let connect = null;

let wh = null;

function intercept(message) {
    if (connect != null && connect.input == message.author) {
        if (message == null) return;
        if (message.deleted) return;
        if (connect.output == 'bot') {
            message.channel.send(message.content);
        } else {
            if (wh == null) return;
            if (message.channel.id == wh.channelID) {
                wh.send(message.content);
            } else if (connect.output.shouldSwitchChannel) {
                wh.edit({
                    channel: message.channel
                }).then(x => x.send(message.content));
            }
        }
        message.delete();
    }
}

async function webhook(user, channel, useNick = false, shouldSwitch = false) {
    console.log('Creating Webhook...');
    const x = await channel.createWebhook(
        useNick
            ? (await channel.guild.members.fetch(user.id)).displayName
            : user.username,
        {
            avatar: user.displayAvatarURL({ format: 'png', dynamic: true })
        }
    );
    console.log('Created Webhook.');
    wh = x;
    connect.output = {
        shouldSwitchChannel: shouldSwitch
    };
}

function bot() {
    connect.output = 'bot';
}

function stop() {
    connect = null;
    if (wh == null) return;
    wh.delete();
    wh = null;
}

function start(user) {
    connect = {
        input: user
    };
}

module.exports = {
    intercept,
    webhook,
    bot,
    stop,
    start
};
