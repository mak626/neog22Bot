// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const sendGridClient = require('@sendgrid/client');
const { PREFIX, COLORS } = require('../utils/constants');
const { sendVerify } = require('../events/guildMemberAdd');
const { getMember, enableVerify } = require('../firebase/firebase_handler');

module.exports = {
    name: 'verify-me',
    usage: `${PREFIX}verify-me`,
    description: 'Verify yourself at server',

    /**
     * @param {Discord.Message} message
     * @param {Discord.Client} client
     */
    async execute(message, args, client) {
        const mailThreshold = 10000;
        const member = message.guild.member(message.author.id);
        const embed = new Discord.MessageEmbed()
            .setTitle('Verification')
            .setColor(COLORS.red)
            .setDescription(`You are already verified ${member.user}`);

        const tempUser = await getMember(member);
        if (tempUser.verified) return message.channel.send(embed);

        // Checking sendGrid mail
        sendGridClient.setApiKey(process.env.SENDGRID);

        const res = (
            await sendGridClient.request({
                method: 'GET',
                url: '/v3/user/credits',
            })
        )[0];

        if (res.statusCode === 200) {
            if (res.body.remain <= mailThreshold) {
                if (enableVerify[0] === true) {
                    enableVerify[0] = false;
                    const serverConfig = client.configs.get(member.guild.id);
                    const channel = client.channels.cache.get(serverConfig.moderator_channel_id);
                    const embedStatus = new Discord.MessageEmbed()
                        .setTitle('Verification Status')
                        .setColor(enableVerify[0] ? COLORS.green : COLORS.red)
                        .setDescription(`${enableVerify[0] ? '`Enabled`' : '`Disabled`'}`)
                        .addField('Remaining Mails', res.body.remain, true)
                        .addField('Total Mails', res.body.total, true)
                        .addField('Next Reset', res.body.next_reset, true);
                    channel.send(embedStatus);
                }
            } else {
                enableVerify[0] = true;
            }
        }

        if (enableVerify[0]) {
            await sendVerify(member, message.channel);
        } else {
            embed.setDescription('We have temporarily disabled verification.\nPlease try again later.');
            return message.channel.send(embed);
        }
    },
};
