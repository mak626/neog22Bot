// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { getLatestDBdump } = require('../firebase/individual_leaderboard');
const { PREFIX, COLORS } = require('../utils/constants');

module.exports = {
    name: 'get-db-dump',
    usage: `${PREFIX}get-db-dump`,
    description: 'Sends a copy of latest database dump to administrators',
    admin: true,
    async execute(message) {
        const embed = new Discord.MessageEmbed();
        try {
            await getLatestDBdump();
            embed.setTitle('Latest Database dump shared :white_check_mark:');
            embed.setDescription('Backup files have been shared with admins :sparkles:');
            embed.setColor(COLORS.green);
        } catch (e) {
            embed.setTitle('An error occured!');
            embed.setDescription("Couldn't share the latest database dump");
            embed.setColor(COLORS.red);
        }
        message.channel.send(embed);
    },
};
