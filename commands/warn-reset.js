const Discord = require('discord.js');
const { resetWarnUser } = require('../firebase/firebase_handler');
const { COLORS, PREFIX } = require('../utils/constants');
const { sendDissapearingMessage } = require('../utils/functions');
const { logger } = require('../utils/logger');

module.exports = {
    name: 'warn-reset',
    admin: true,
    moderator: true,
    usage: `${PREFIX}warn-reset <@user-name>`,
    description: 'Resets the warning count to 0 for a user',

    /**
     * @param {Discord.Message} message
     */
    async execute(message) {
        const member = message.guild.member(message.author.id);

        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to reset warnings ${member}`);
        }

        if (!message.mentions.users.first()) {
            return sendDissapearingMessage(message, `User may have left this server or you didn't tag someone! ${member}`);
        }

        const embed = new Discord.MessageEmbed();
        const tagUser = message.mentions.users.first();
        const taggedUser = message.guild.member(tagUser);
        await resetWarnUser(taggedUser);

        embed
            .setTitle(':white_check_mark: Successful')
            .setDescription(`Reset Warning count for **${taggedUser.displayName}**\n\nReset done by ${member}`)
            .setThumbnail(tagUser.displayAvatarURL())
            .setColor(COLORS.green);

        logger.info(`${tagUser.tag} warn count has been reset by ${message.author.tag}`);
        return message.channel.send(embed);
    },
};
