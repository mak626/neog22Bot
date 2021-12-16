// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const messageEvent = require('./message');

module.exports = {
    name: 'messageUpdate',

    /**
     * @param {Discord.Message} oldMessage
     * @param {Discord.Message} message
     * @param {Discord.Client} client
     * */
    async execute(oldMessage, message, client) {
        messageEvent.execute(message, client);
    },
};
