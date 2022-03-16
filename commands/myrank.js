const Discord = require('discord.js');
const { PREFIX } = require('../utils/constants');
const { getUserLeaderBoard } = require('../firebase/individual_leaderboard');

module.exports = {
    name: 'myrank',
    usage: `${PREFIX}myrank`,
    description: 'Shows your rank',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        const user = message.member;
        const person = await getUserLeaderBoard(user);

        const embed = new Discord.MessageEmbed()
            .setTitle('🏆 neoG LeaderBoard 🏆')
            .setThumbnail(user.user.displayAvatarURL())
            .setColor(message.member.displayHexColor)
            .addField('Name', user.user.username, true)
            .addField('Tag', user.user.tag, true);

        if (person) {
            embed
                .addField('Rank', person.rank, true)
                .addField('Overall Points', person.total_points, true)
                .addField('Review Points', person.review_points, true)
                .addField('Blog Points', person.blog_points, true)
                .addField('Debug Points', person.debug_points, true)
                .addField('Project Points', person.project_points, true)
                .addField('Concept Points', person.concept_points, true)
                .addField('Meme Points', person.meme_points, true)
                .addField('Gratitude Points', person.grattitude_points, true)
                .addField('Standup Points', person.standup_points || 0, true);
        } else embed.setFooter('Please start studying / helping others to get yourself a rank.');

        return message.channel.send(embed);
    },
};
