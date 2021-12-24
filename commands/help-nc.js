const Discord = require('discord.js');
const fs = require('fs');
const { PREFIX } = require('../utils/constants');

module.exports = {
    name: 'help-nc',
    usage: `${PREFIX}help-nc`,
    description: 'Gives basic information about commands',

    /**
     * @param {Discord.Message} message
     */
    async execute(message) {
        const admins = message.member.permissions.has('MANAGE_ROLES');
        const moderators = message.member.permissions.has('MANAGE_MESSAGES');
        const faculty = message.member.permissions.has('VIEW_AUDIT_LOG');

        const commandFiles = fs.readdirSync('./commands/').filter((file) => file.endsWith('.js'));

        const commandsArray = commandFiles
            .map((file) => {
                const command = require(`./${file}`);
                const description = `\`${command.usage === undefined ? '-' : command.usage}\``;

                if (command.hidden) return 'HIDDEN';
                if (command.disable) return 'HIDDEN';
                if (command.faculty && faculty) return description;
                if (command.moderator && moderators) return description;
                if (command.admin && admins) return description;
                if (command.admin || command.moderator || command.faculty) return 'DELETE';
                return description;
            })
            .filter((command) => command !== 'DELETE')
            .filter((command) => command !== 'HIDDEN');

        commandsArray.sort();
        const msg = `**Commands Usage**\n\n${commandsArray.join('\n')}`;
        return message.channel.send(msg, { split: true });
    },
};