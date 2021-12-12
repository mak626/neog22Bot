const Discord = require('discord.js');
const { updatePodLeaderboard } = require('../firebase/pod_leaderboard');
const { updateTeamLeaderboard } = require('../firebase/team_leaderboard');
const { COLORS, PREFIX, leaderboardPoints } = require('../utils/constants');
const { teams } = require('../assets/data/teams_static.json');
const { sendDissapearingMessage, findChannelById, checkRole } = require('../utils/functions');
const { updateIndividualLeaderboard } = require('../firebase/individual_leaderboard');

module.exports = {
    name: 'gw',
    usage: `${PREFIX}gw <@user-name> | <@team_role> | <@pod_role>  [mark]`,
    description: 'Grades mark to a user | team | pod from server',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client) {
        const member = message.guild.member(message.author.id);

        if (!message.member.hasPermission('VIEW_AUDIT_LOG')) {
            return sendDissapearingMessage(message, `You are not wise enough to do that ${message.author}`);
        }

        if (!message.mentions.users.first() && !message.mentions.roles.first()) {
            return sendDissapearingMessage(message, `Please mention the role/user ${member}`);
        }
        if (message.mentions.users.size > 1 || message.mentions.roles.size > 1) {
            return sendDissapearingMessage(message, `Please mention only one role/user ${member}`);
        }

        let podRole = false;
        let teamRole = false;
        let userRole = false;
        let role;
        if (message.mentions.users.first()) {
            userRole = true;
            role = message.guild.member(message.mentions.users.first());
            const team = role.roles.cache.find((e) => teams[e.id]);
            if (!team) return sendDissapearingMessage(message, `${role} does not belong to a team ${member}`);
        }
        if (message.mentions.roles.first()) {
            const roles = await checkRole(message.mentions.roles.first());
            role = message.mentions.roles.first();
            if (roles.podRole) podRole = roles.podRole;
            if (roles.teamRole) teamRole = roles.teamRole;
            if (!podRole && !teamRole) return sendDissapearingMessage(message, `Please mention a valid team/pod role ${member}`);
        }

        let points;
        if (!args[1]) {
            if (userRole) points = leaderboardPoints.individual;
            if (podRole) points = leaderboardPoints.pod;
            if (teamRole) points = leaderboardPoints.team;
        } else points = parseInt(args[1].trim(), 10);

        if (Number.isNaN(points)) {
            return sendDissapearingMessage(message, `You didn't specify a number for points, ${message.author}!`);
        }

        let embed = new Discord.MessageEmbed();
        embed.setColor(COLORS.orange);

        const authorUser = message.guild.member(message.author);

        embed
            .setTitle('Congratulations :partying_face: :tada:')
            .setDescription(`${authorUser} awarded ${role} \`${points}\` points`)
            .setColor(role.color);
        if (userRole) embed.setThumbnail(role.user.displayAvatarURL());

        if (userRole) {
            await updateIndividualLeaderboard(role, {
                total_points: points,
                review_points: 0,
                blog_points: 0,
                debug_points: 0,
                project_points: 0,
                concept_points: 0,
                meme_points: 0,
            });
        }
        if (podRole) await updatePodLeaderboard(role, points);
        if (teamRole) await updateTeamLeaderboard(role, points);

        const channel = findChannelById(message, client.configs.get(message.guild.id).leaderboard_channel_id);
        await channel.send(embed);
        embed = new Discord.MessageEmbed().setColor(COLORS.orange).setDescription(`Thank you for grading ${role} \`${points}\` points`);

        return message.channel.send(embed);
    },
};
