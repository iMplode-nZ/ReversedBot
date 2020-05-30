const connect = require('../connect');

module.exports = {
    name: 'disconnect',
    description: '???',
    guildOnly: true,
    adminOnly: 'owner',
    delete: true,
    hidden: true,
    aliases: [],
    usage: '',
    execute() {
        connect.stop();
    }
};
