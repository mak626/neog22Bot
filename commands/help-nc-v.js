const Discord = require('discord.js');
const fs = require('fs');
const { PREFIX, COLORS } = require('../utils/constants');

module.exports = {
    name: 'help-nc-v',
    usage: `${PREFIX}help-nc-v`,
    description: 'Gives detailed information about commands',

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
                const description = {
                    name: command.name,
                    value: [
                        `\`${command.usage === undefined ? '-' : command.usage}\``,
                        `${command.description === undefined ? '-' : command.description}`,
                    ].join('\n'),
                };

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

        const embed = new Discord.MessageEmbed({
            title: 'Commands',
            color: COLORS.purple,
            fields: commandsArray,
        });

        return message.channel.send(embed);
    },
};
