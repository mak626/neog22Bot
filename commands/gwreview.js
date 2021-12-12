const Discord = require('discord.js');
const { teams } = require('../assets/data/teams_static.json');
const { COLORS, PREFIX, leaderboardPoints } = require('../utils/constants');
const { sendDissapearingMessage, findChannelById } = require('../utils/functions');
const { updateIndividualLeaderboard } = require('../firebase/individual_leaderboard');

module.exports = {
    name: 'gwreview',
    usage: `${PREFIX}gwreview <@user-name> [mark]`,
    description: 'Grades review mark to a user from server',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client) {
        const member = message.guild.member(message.author.id);
        args = args.filter((e) => e.trim() !== '');

        if (!message.member.hasPermission('VIEW_AUDIT_LOG')) {
            return sendDissapearingMessage(message, `You are not wise enough to do that ${message.author}`);
        }

        if (!message.mentions.users.first()) {
            return sendDissapearingMessage(message, `Please mention the user ${member}`);
        }
        if (message.mentions.users.size > 1) {
            return sendDissapearingMessage(message, `Please mention only one user ${member}`);
        }

        const taggedUser = message.guild.member(message.mentions.users.first());
        const team = taggedUser.roles.cache.find((e) => teams[e.id]);
        if (!team) return sendDissapearingMessage(message, `${taggedUser} does not belong to a team ${member}`);

        let points;
        if (!args[1]) points = leaderboardPoints.individual;
        else points = parseInt(args[1].trim(), 10);

        if (Number.isNaN(points)) {
            return sendDissapearingMessage(message, `You didn't specify a number for points, ${message.author}!`);
        }

        let embed = new Discord.MessageEmbed();
        embed.setColor(COLORS.orange);

        const authorUser = message.guild.member(message.author);

        embed
            .setTitle('Congratulations :partying_face: :tada:')
            .setDescription(`${authorUser} awarded ${taggedUser} \`${points}\` review points`)
            .setColor(taggedUser.color)
            .setThumbnail(taggedUser.user.displayAvatarURL());

        await updateIndividualLeaderboard(taggedUser, {
            total_points: points,
            review_points: points,
            blog_points: 0,
            debug_points: 0,
            project_points: 0,
            concept_points: 0,
            meme_points: 0,
        });

        const channel = findChannelById(message, client.configs.get(message.guild.id).leaderboard_channel_id);
        await channel.send(embed);
        embed = new Discord.MessageEmbed()
            .setColor(COLORS.orange)
            .setDescription(`Thank you for grading ${taggedUser} \`${points}\` review points`);

        return message.channel.send(embed);
    },
};
