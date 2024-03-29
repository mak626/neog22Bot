const Discord = require('discord.js');
const { getSheetValuesByName } = require('../excel/spreadsheet_handler');
const { PREFIX, COLORS } = require('../utils/constants');
const { sendDissapearingMessage } = require('../utils/functions');
const sheetName = 'Roles';

module.exports = {
    name: 'role-excel',
    admin: true,
    usage: `${PREFIX}role-excel <@role_name>`,
    description: `Assigns the given role_name to given users from excel sheet ${sheetName}`,

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        if (!message.member.hasPermission('MANAGE_ROLES')) return sendDissapearingMessage(':x: You do not have permission to assign role');
        if (!message.mentions.roles.first()) return sendDissapearingMessage(message, `You didn't tag a role, ${message.author}!`);

        const { id: roleID, name: roleName } = message.mentions.roles.first();
        const embed = new Discord.MessageEmbed().setColor(COLORS.green).setTitle(`Assigned the '@${roleName}' role to given users`);

        const sheetData = (await getSheetValuesByName(sheetName)).splice(1);
        const unknownPeople = [];

        for (let i = 0; i < sheetData.length; i++) {
            const user = message.guild.members.cache.find((u) => `${u.user.username}#${u.user.discriminator}` === sheetData[i][1]);
            if (!user) {
                unknownPeople.push(sheetData[i][1]);
                continue;
            }
            await user.roles.add(roleID);
        }
        if (unknownPeople.length === 0) return message.channel.send(embed);
        embed.setColor(COLORS.yellow).setTitle(`:warning: Some users were not assigned the role '@${roleName}'`);
        await message.channel.send(embed);
        return message.channel.send(unknownPeople.join('\n'), { split: true });
    },
};
