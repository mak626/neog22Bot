const Discord = require('discord.js');
const { PREFIX, COLORS } = require('../utils/constants');
const { findChannelByName, findRoleById, sendDissapearingMessage, findChannelById } = require('../utils/functions');

module.exports = {
    name: 'temp',
    admin: true,
    usage: `${PREFIX}temp`,
    description: 'Deletes category CATEGORY_NAME with all its sub channels and roles',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message, args) {
        // const CATEGORY_ID = args.join(' ').trim().toLocaleUpperCase();

        message.guild.channels.cache.forEach((e) => {
            if (!e.parent && e.type !== 'category') {
                e.delete();
            }
        });
    },
};
