const Discord = require('discord.js');
const fs = require('fs');
const { PREFIX, COLORS } = require('../utils/constants');
const { findChannelByName, findRoleById, sendDissapearingMessage, findChannelById } = require('../utils/functions');

module.exports = {
    name: 'temp',
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

        const data = { pods: [] };

        const elj = {};

        for (let i = 0; i < 20; i++) {
            const CATEGORY_ID = `POD ${i + 1}`;
            const category = findChannelByName(message, CATEGORY_ID);
            if (!category) continue;

            const curData = {
                id: '',
                name: CATEGORY_ID,
                teams: [],
            };

            category.children.forEach(async (channel) => {
                channel.permissionOverwrites.forEach(async (role) => {
                    const teamRole = findRoleById(message, role.id);
                    if (!teamRole) return;
                    if (ignoreRoles.find((e) => e.id === teamRole.id)) return;
                    if (teamRole.name.includes('POD') || teamRole.name.includes('everyone') || teamRole.name.includes('Captain')) return;

                    if (!curData.teams.find((e) => e.id === teamRole.id)) {
                        curData.teams.push({ id: teamRole.id, name: teamRole.name });

                        elj[teamRole.id] = {
                            id: teamRole.id,
                            name: teamRole.name,
                            points: 0,
                        };
                    }
                    return true;
                });
            });

            category.permissionOverwrites.forEach(async (role) => {
                const categoryRole = findRoleById(message, role.id);
                if (!categoryRole) return;
                if (ignoreRoles.find((e) => e.id === categoryRole.id)) return;
                if (categoryRole.name.includes('POD')) curData.id = categoryRole.id;
                return true;
            });

            data.pods.push(curData);
        }

        fs.writeFileSync('test.json', JSON.stringify(elj, null, 5));

        const embed = new Discord.MessageEmbed({
            title: 'DOne',
            color: COLORS.red,
        });

        message.reply(embed);
    },
};
