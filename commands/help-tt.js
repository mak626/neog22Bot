const Discord = require('discord.js');
const fs = require('fs');
const { PREFIX, COLORS } = require('../utils/constants');

module.exports = {
    name: 'help-tt',
    usage: `${PREFIX}help-tt`,
    description: 'Gives basic information about commands',

    /**
     * @param {Discord.Message} message
     */
    async execute(message) {
        const admins = message.member.permissions.has('MANAGE_ROLES');
        const moderators = message.member.permissions.has('MANAGE_MESSAGES');

        const commandFiles = fs.readdirSync('./commands/').filter((file) => file.endsWith('.js'));

        const commandsArray = commandFiles
            .map((file) => {
                const command = require(`./${file}`);
                const description = `\`${command.usage === undefined ? '-' : command.usage}\``;
                if (command.hidden) return 'HIDDEN';
                if (command.moderator && moderators) return description;
                if (command.admin && admins) return description;
                if (command.admin || command.moderator) return 'DELETE';
                return description;
            })
            .filter((command) => command !== 'DELETE')
            .filter((command) => command !== 'HIDDEN');

        commandsArray.sort();
        const embed = new Discord.MessageEmbed({
            title: 'Command Usage',
            color: COLORS.purple,
            description: commandsArray.join('\n'),
        });
        message.channel.send({ embed });
    },
};
