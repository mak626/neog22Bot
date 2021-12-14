const Discord = require('discord.js');
const { updateIndividualLeaderboard } = require('../firebase/individual_leaderboard');
const { COLORS, PREFIX } = require('../utils/constants');
const { sendDissapearingMessage, findChannelById } = require('../utils/functions');

module.exports = {
    name: 'thank',
    usage: `${PREFIX}thanks OR ty OR thankyou <@user-name> [reason]`,
    description: 'Thanks a member from server',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client) {
        const member = message.guild.member(message.author.id);

        if (!message.mentions.users.first()) {
            return sendDissapearingMessage(message, `Please mention the person ${member}`);
        }
        if (message.mentions.users.size > 1) {
            return sendDissapearingMessage(message, `Please mention only one person ${member}`);
        }

        let reason;

        args.splice(0, 1);
        if (args.length < 2) reason = 'Helping out a fellow dev';
        else reason = args.join(' ').trim();

        let embed = new Discord.MessageEmbed();
        embed.setColor(COLORS.orange);

        const tagUser = message.mentions.users.first();
        const taggedUser = message.guild.member(tagUser);
        const authorUser = message.guild.member(message.author);

        if (member === taggedUser) {
            return sendDissapearingMessage(message, `Why do you want to thank yourself my friend ${member}`);
        }

        embed.setTitle('Thank you :partying_face:');
        embed.setDescription(`\`${taggedUser.displayName}\` for helping \`${authorUser.displayName}\`\n\n**Reason**: ${reason}`);
        embed.setThumbnail(tagUser.displayAvatarURL());
        await updateIndividualLeaderboard(taggedUser, {
            grattitude_points: 1,
        });
        const channel = findChannelById(message, client.configs.get(message.guild.id).grattitude_channel_id);

        await channel.send(embed);
        embed = new Discord.MessageEmbed()
            .setColor(COLORS.orange)
            .setDescription('Thank you for expressing your grattitude towards others who help you');

        return message.channel.send(embed);
    },
};
