const Discord = require('discord.js');
const { getUserWarn } = require('../firebase/firebase_handler');
const { COLORS, PREFIX } = require('../utils/constants');
const { sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'warn-count',
    admin: true,
    moderator: true,
    usage: `${PREFIX}warn-count <@user-name>`,
    description: 'Gives history and count of warnings of a user',

    /**
     * @param {Discord.Message} message
     */
    async execute(message) {
        const member = message.guild.member(message.author.id);

        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to use this ${member}`);
        }

        if (!message.mentions.users.first()) {
            return sendDissapearingMessage(message, `User may have left this server or you didn't tag someone! ${member}`);
        }

        const embed = new Discord.MessageEmbed();
        const tagUser = message.mentions.users.first();
        const taggedUser = message.guild.member(tagUser);

        const warnUser = await getUserWarn(taggedUser);
        if (!warnUser || !warnUser.offences) {
            embed.setDescription(`No warnings found for ${taggedUser}`);
            embed.setColor(COLORS.red);
            return message.channel.send(embed);
        }

        warnUser.offences.sort((a, b) => b.date - a.date);
        const offenceString = warnUser.offences.map((e) => `\`${new Date(e.date).toLocaleString()}\`\n\`\`\`${e.reason}\`\`\``);

        embed
            .setTitle('Warnings')
            .setColor(COLORS.green)
            .addField('ID', taggedUser.id, true)
            .addField('Name', taggedUser.nickname ? taggedUser.nickname : taggedUser.displayName, true)
            .addField('Tag', taggedUser.user.tag, true)
            .setDescription([`${offenceString.join('\n')}`, `\n**Current Warning Count:** \` ${warnUser.count} \``].join('\n'))
            .setThumbnail(tagUser.displayAvatarURL())
            .setColor(COLORS.cyan);

        return message.channel.send(embed);
    },
};
