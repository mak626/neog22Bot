const Discord = require('discord.js');
const { PREFIX } = require('../utils/constants');
const { getUserLeaderBoard } = require('../firebase/firebase_handler');

module.exports = {
    name: 'myhelprank',
    usage: `${PREFIX}myhelprank`,
    description: 'Shows your rank of Grattitude',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        const user = message.member;
        const person = await getUserLeaderBoard(user);

        const embed = new Discord.MessageEmbed()
            .setTitle('🏆 Gratitude LeaderBoard 🏆')
            .setThumbnail(user.user.displayAvatarURL())
            .setColor(message.member.displayHexColor)
            .addField('Name', user.user.username, true)
            .addField('Tag', user.user.tag, true);

        if (person) embed.addField('Rank', person.rank, true).addField('Points', person.points, true);
        else embed.setFooter('Please start helping others to get yourself a rank.');

        return message.channel.send(embed);
    },
};
