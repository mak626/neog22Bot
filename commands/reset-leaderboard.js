// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const fs = require('fs');
const { resetIndividualLeaderboard } = require('../firebase/individual_leaderboard');
const { PREFIX, COLORS } = require('../utils/constants');
const { checkRole, sendDissapearingMessage } = require('../utils/functions');


module.exports = {
    name: 'reset-leaderboard',
    usage: `${PREFIX}reset-leaderboard`,
    description: 'Reset the leader board',
    admin: true,
    async execute(message) {
        const embed = new Discord.MessageEmbed();
        try {
            await resetIndividualLeaderboard();
            embed.setTitle('Leaderboard has been reset successfully :white_check_mark:');
            embed.setDescription('Backup files have been shared :sparkles:');
            embed.setColor(COLORS.green);
        } catch (e) {
            embed.setTitle('An error occured!');
            embed.setDescription("Couldn't reset the leaderboard");
            embed.setColor(COLORS.red);
        }
        message.channel.send(embed);
    }
};
