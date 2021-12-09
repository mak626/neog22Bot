const Discord = require('discord.js');
const { addWarningSheet } = require('../excel/spreadsheet_handler');
const { updateWarnUser, getUserWarn } = require('../firebase/firebase_handler');
const { COLORS, PREFIX } = require('../utils/constants');
const { sendDissapearingMessage } = require('../utils/functions');
const { logger } = require('../utils/logger');

module.exports = {
    name: 'warn-add',
    admin: true,
    moderator: true,
    usage: `${PREFIX}warn-add <@user-name> <reason>`,
    description: 'Adds a warning to given user and increments warn count',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message, args) {
        const author = message.guild.member(message.author.id);

        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to add warnings ${author}`);
        }

        args = args.filter((e) => e !== '');
        if (!message.mentions.users.first()) return sendDissapearingMessage(message, `You need to tag someone! ${author}`);
        if (args.length < 2) return sendDissapearingMessage(message, `Whats the reason? ${author}`);

        const embed = new Discord.MessageEmbed();
        const tagUser = message.mentions.users.first();
        const taggedUser = message.guild.member(tagUser);

        args = args.splice(1);
        const reason = args.join(' ');

        const offence = {
            date: new Date().toISOString(),
            reason,
            author: author.id,
        };

        await updateWarnUser(taggedUser, offence);
        await addWarningSheet(taggedUser, offence, author);
        logger.info(`${tagUser.tag} has been warned by ${author.user.tag}`);

        const warnUser = await getUserWarn(taggedUser);
        embed
            .setTitle(':white_check_mark: Added warning')
            .setColor(COLORS.green)
            .addField('ID', taggedUser.id, true)
            .addField('Name', taggedUser.nickname ? taggedUser.nickname : taggedUser.displayName, true)
            .addField('Tag', taggedUser.user.tag, true)
            .addField('Warn Count', warnUser.count, true)
            .setThumbnail(tagUser.displayAvatarURL())
            .setDescription(
                [
                    `Date: \`${new Date(offence.date).toLocaleString()}\``,
                    `Reason: \`\`\`${offence.reason}\`\`\``,
                    `Warned by: ${author}`,
                ].join('\n')
            );
        return message.channel.send(embed);
    },
};
