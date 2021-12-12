const Discord = require('discord.js');
const { updatePodLeaderboard } = require('../firebase/pod_leaderboard');
const { updateTeamLeaderboard } = require('../firebase/team_leaderboard');
const { COLORS, PREFIX, leaderboardPoints } = require('../utils/constants');
const { sendDissapearingMessage, findChannelById, checkRole } = require('../utils/functions');

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

        embed.setTitle('Congratulations :partying_face: :tada:');
        embed.setDescription(`\`${authorUser.displayName}\` awarded ${role} \`${points}\` points`);
        embed.setColor(role.color);
        if (userRole) embed.setThumbnail(role.user.displayAvatarURL());

        //TODO: Individual leaderboard
        if (podRole) updatePodLeaderboard(role, points);
        if (teamRole) updateTeamLeaderboard(role, points);

        const channel = findChannelById(message, client.configs.get(message.guild.id).leaderboard_channel_id);
        await channel.send(embed);
        embed = new Discord.MessageEmbed().setColor(COLORS.orange).setDescription(`Thank you for grading ${role} \`${points}\` points`);

        return message.channel.send(embed);
    },
};
