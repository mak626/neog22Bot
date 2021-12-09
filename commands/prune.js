const Discord = require('discord.js');
const { PREFIX, COLORS } = require('../utils/constants');
const { sendDissapearingMessage } = require('../utils/functions');
const { logger } = require('../utils/logger');

module.exports = {
    name: 'prune',
    admin: true,
    usage: `${PREFIX}prune`,
    description: 'Prunes unverified member from server',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client) {
        const member = message.guild.member(message.author.id);
        if (!message.member.hasPermission('KICK_MEMBERS')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to kick ${member}`);
        }

        const embed = new Discord.MessageEmbed();

        const serverConfig = client.configs.get(member.guild.id);
        const unverifiedRole = member.guild.roles.cache.get(serverConfig.unverified_role_id);
        const members = unverifiedRole.members.array();
        const dayLimit = 15;
        const kickedMembers = [];
        for (let index = 0; index < members.length; index++) {
            const tempMember = members[index];
            const diffTime = Math.abs(new Date() - tempMember.joinedAt);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > dayLimit) {
                kickedMembers.push(tempMember);
                tempMember.kick(`Been unverified for ${dayLimit} days`);
            }
        }

        if (kickedMembers.length === 0) {
            embed.setTitle('No users have been kicked').setColor(COLORS.red);
        } else {
            embed
                .setTitle('Following users have been kicked')
                .setDescription(`${kickedMembers.filter((e) => e.user.tag).join('\n')}`)
                .setColor(COLORS.cyan);
        }

        logger.info(`${member.user.tag} used pruning of unverified members`);
        return message.channel.send(embed);
    },
};
