const Discord = require('discord.js');
const { PREFIX, COLORS } = require('../utils/constants');
const { findChannelByName, findRoleById, sendDissapearingMessage, findChannelById } = require('../utils/functions');

module.exports = {
    name: 'pod-delete',
    admin: true,
    usage: `${PREFIX}pod-delete`,
    description: 'Deletes category CATEGORY_NAME with all its sub channels and roles',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message, args, client) {
        if (!message.member.hasPermission('MANAGE_CHANNELS')) {
            return sendDissapearingMessage(message, `You are not wise enough to make those channels my friend ${message.author}`);
        }

        const serverConfig = client.configs.get(message.guild.id);
        const paRole = findRoleById(message, serverConfig.pa_role_id);
        const taRole = findRoleById(message, serverConfig.ta_role_id);
        const maRole = findRoleById(message, serverConfig.ma_role_id);
        const caRole = findRoleById(message, serverConfig.ca_role_id);
        const ignoreRoles = [paRole, taRole, caRole, maRole];

        for (let i = 0; i < 20; i++) {
            const CATEGORY_ID = `POD ${i + 1}`;
            const category = findChannelByName(message, CATEGORY_ID);
            if (!category) continue;

            category.children.forEach(async (channel) => {
                channel.permissionOverwrites.forEach(async (role) => {
                    const teamRole = findRoleById(message, role.id);
                    if (!teamRole) return;
                    if (ignoreRoles.find((e) => e.id === teamRole.id)) return;
                    await teamRole.delete();
                    return true;
                });
                await channel.delete();
            });

            category.permissionOverwrites.forEach(async (role) => {
                const categoryRole = findRoleById(message, role.id);
                if (!categoryRole) return;
                if (ignoreRoles.find((e) => e.id === categoryRole.id)) return;
                await categoryRole.delete();
                return true;
            });
            await category.delete();
        }

        const embed = new Discord.MessageEmbed({
            title: 'Deleted Category Succesfully',
            color: COLORS.red,
        });

        message.reply(embed);
    },
};
