// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { PREFIX } = require('../utils/constants');
const { logger } = require('../utils/logger');

module.exports = {
    name: 'ready',

    /** @param {Discord.Client} client */
    execute(client) {
        const guilds = client.guilds.cache.map((guild) => guild.name);
        if (PREFIX === '!') logger.warn('PRODUCTION_MODE');
        else logger.debug('DEVELOPMENT_MODE');

        logger.info('neoG22 Bot Is Ready!');
        logger.info(`PREFIX: ${PREFIX}`);
        logger.info('Handling Guilds:', guilds.join(', '));
    },
};
