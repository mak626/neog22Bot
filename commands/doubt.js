const Discord = require('discord.js');
const { COLORS, PREFIX } = require('../utils/constants');
const { sendDissapearingMessage, findChannelById } = require('../utils/functions');
const { pods: podChannelData } = require('../assets/data/doubt_static.json');

module.exports = {
    name: 'doubt',
    usage: `${PREFIX}doubt <question>`,
    description: 'Ask a doubt and get it resolved by the faculty',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message, args) {
        const member = message.guild.member(message.author.id);
        if (args.length < 1) return sendDissapearingMessage(message, `Whats the question? ${member}`);

        const reason = args.join(' ').trim();

        const podChannel = podChannelData.find((e) => e.id === message.channel.parentID);
        if (!podChannel) sendDissapearingMessage('No Channel Found');

        let embed = new Discord.MessageEmbed();
        embed.setColor(COLORS.orange);

        const authorUser = message.guild.member(message.author);

        embed
            .setTitle(`Doubt Asked in ${podChannel.name}`)
            .addField('User', `${authorUser.user.tag}`)
            .addField('Message', reason)
            .addField('Location', message.url)
            .setThumbnail(authorUser.user.displayAvatarURL());

        const channel = findChannelById(message, podChannel['doubt-channel']);
        await channel.send(embed);

        embed = new Discord.MessageEmbed().setColor(COLORS.orange).setDescription('Your doubt has been recorded');
        return message.channel.send(embed);
    },
};
