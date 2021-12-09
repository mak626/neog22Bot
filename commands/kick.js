const Discord = require('discord.js');
const { PREFIX, COLORS } = require('../utils/constants');
const { sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'kick',
    admin: true,
    usage: `${PREFIX}kick <@user-name> <reason>`,
    description: 'Kicks a member from server',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message, args) {
        const member = message.guild.member(message.author.id);
        if (!message.member.hasPermission('KICK_MEMBERS')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to kick ${member}`);
        }

        args = args.filter((e) => e !== '');

        if (!message.mentions.users.first()) return sendDissapearingMessage(message, `You need to tag someone! ${member}`);
        if (args.length < 2) return sendDissapearingMessage(message, `Whats the reason? ${member}`);

        args = args.splice(1);
        const reason = args.join(' ');
        const embed = new Discord.MessageEmbed();

        const tagUser = message.mentions.users.first();
        const taggedUser = message.guild.member(tagUser);

        if (member === taggedUser) return sendDissapearingMessage(message, `Why do you want to kick yourself my friend ${member}`);
        if (taggedUser.user.bot) return sendDissapearingMessage(message, `If you kick me who will help you my friend ${member}`);

        try {
            try {
                await taggedUser.send(
                    [
                        `Dear ${taggedUser},`,
                        'We have noticed you are not following our guidelines properly',
                        'As mentioned earlier we will not tolerate any kind of misbehaviour,',
                        'You are being `KICKED` from **Team Tanay Community**',
                    ].join('\n')
                );
            } catch (error) {}

            await taggedUser.kick(reason);
            embed.setTitle(`${tagUser.tag} has been kicked`);
            embed.setFooter(`Reason: ${reason}`, taggedUser.user.displayAvatarURL()).setColor(COLORS.cyan);

            return message.channel.send(embed);
        } catch (e) {
            return sendDissapearingMessage(message, `I am sorry but that person is wiser than you my friend ${member}`);
        }
    },
};
