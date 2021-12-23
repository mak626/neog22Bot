// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');
const { PREFIX } = require('../utils/constants');
const { getPodLeaderBoard } = require('../firebase/pod_leaderboard');
const { sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'ldb-pods',
    usage: `${PREFIX}ldb-pods`,
    description: 'Shows the leaderboard of pods',
    faculty: true,

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        if (!message.member.hasPermission('VIEW_AUDIT_LOG')) {
            return sendDissapearingMessage(message, `You are not wise enough to do that ${message.author}`);
        }

        const hbs = fs.readFileSync('./views/teampod_leaderboard.hbs', { encoding: 'utf-8' });
        const path = './assets/pod_image.png';

        let data = await getPodLeaderBoard();
        data = data.map((e, index) => {
            const role = message.guild.roles.cache.get(e.id);
            return {
                index: index + 1,
                name: role.name,
                color: role.hexColor,
                points: e.points,
            };
        });

        await nodeHtmlToImage({
            output: path,
            puppeteerArgs: {
                executablePath: process.env.CHROME_BIN || null,
                args: ['--no-sandbox', '--headless', '--disable-gpu'],
            },
            html: hbs,
            selector: 'body > div > div',
            content: { type: 'POD', team: data },
        });

        return message.channel.send('', { files: [path] });
    },
};
