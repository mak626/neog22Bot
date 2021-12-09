// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const client = require('@sendgrid/client');
const { PREFIX, COLORS } = require('../utils/constants');
const { enableVerify } = require('../firebase/firebase_handler');
const { sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'verify-status',
    admin: true,
    usage: `${PREFIX}verify-status`,
    description: 'Check verification command status and sendgrid details',

    /**
     * @param {Discord.Message} message
     */
    async execute(message) {
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to update database ${message.author}`);
        }

        client.setApiKey(process.env.SENDGRID);
        const embed = new Discord.MessageEmbed();

        const res = (
            await client.request({
                method: 'GET',
                url: '/v3/user/credits',
            })
        )[0];

        if (res.statusCode === 200) {
            embed
                .setTitle('Verification Status')
                .setColor(enableVerify[0] ? COLORS.green : COLORS.red)
                .addField('Remaining', res.body.remain, true)
                .addField('Total', res.body.total, true)
                .addField('Next Reset', res.body.next_reset, true)
                .setDescription(`${enableVerify[0] ? '`Enabled`' : '`Disabled`'}`)
                .setColor(COLORS.cyan);
        } else {
            embed
                .setTitle('Verification Status')
                .setColor(enableVerify[0] ? COLORS.green : COLORS.red)
                .setDescription(`${enableVerify[0] ? '`Enabled`' : '`Disabled`'}`);
        }

        return message.channel.send(embed);
    },
};
