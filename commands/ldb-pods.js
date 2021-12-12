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

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        if (!message.member.hasPermission('VIEW_AUDIT_LOG')) {
            return sendDissapearingMessage(message, `You are not wise enough to do that ${message.author}`);
        }

        const path = './assets/pod_image.png';
        let html = fs.readFileSync('./assets/teampod_leaderboard.html', { encoding: 'utf-8' }).replace(new RegExp('#TYPE', 'g'), 'POD');

        const data = await getPodLeaderBoard();
        data.forEach((e, index) => {
            const role = message.guild.roles.cache.get(e.id);
            html = html.replace(`#NAME${index}`, role.name);
            html = html.replace(`#COLOR${index}`, role.hexColor);
            html = html.replace(`#POINT${index}`, e.points);
        });

        await nodeHtmlToImage({
            output: path,
            puppeteerArgs: {
                executablePath: process.env.CHROME_BIN || null,
                args: ['--no-sandbox', '--headless', '--disable-gpu'],
            },
            html,
        });

        return message.channel.send('', { files: [path] });
    },
};
