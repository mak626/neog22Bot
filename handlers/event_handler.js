const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { logger } = require('../utils/logger');

/** @param {Discord.Client} client */
module.exports = (client) => {
    const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

    eventFiles.forEach((file) => {
        const event = require(`../events/${file}`);
        client.on(event.name, async (...args) => {
            try {
                await event.execute(...args, client);
            } catch (e) {
                logger.error(`Event ${event.name} Error: ${e.message} | ${e?.stack}`);
            }
        });
    });
};
