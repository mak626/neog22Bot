const Discord = require('discord.js');
const { getMember } = require('../firebase/firebase_handler');
const { PREFIX } = require('../utils/constants');
const { sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'find-user',
    admin: true,
    usage: `${PREFIX}find-user <@user_name>`,
    description: 'Gives information about given user',

    /**
     * @param {Discord.Message} message
     */
    async execute(message) {
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to use this ${message.author}`);
        }
        if (!message.mentions.users.first()) return sendDissapearingMessage(message, `You didn't tag a user, ${message.author}!`);

        const taggedUser = message.mentions.users.first();
        const member = message.guild.member(taggedUser);
        const person = await getMember(member);

        const embed = new Discord.MessageEmbed()
            .setColor(member.roles.color.hexColor)
            .setThumbnail(taggedUser.displayAvatarURL())
            .addField(`${taggedUser.tag}`, `${member}`)
            .addField('ID:', `${member.id}`)
            .addField('Nickname:', person.name)
            .addField('Email:', person.email)
            .addField('GitHub:', person.github)
            .addField('Verified:', person.verified ? ':white_check_mark:' : ':x:')
            .addField('Joined', `${member.joinedAt.toDateString()}`)
            .addField('Roles:', member.roles.cache.map((roles) => `${roles}`).join(' '));

        return message.channel.send(embed);
    },
};
