const Discord = require('discord.js');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');
const { PREFIX } = require('../utils/constants');
const podData = require('../assets/data/pod_static.json');
const { getTeamLeaderBoard } = require('../firebase/team_leaderboard');
const { sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'ldb-teams',
    usage: `${PREFIX}ldb-teams`,
    description: 'Shows the leaderboard of teams',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        if (!message.member.hasPermission('VIEW_AUDIT_LOG')) {
            return sendDissapearingMessage(message, `You are not wise enough to do that ${message.author}`);
        }
        const path = './assets/team_image.png';
        let html = fs.readFileSync('./assets/teampod_leaderboard.html', { encoding: 'utf-8' }).replace(new RegExp('#TYPE', 'g'), 'TEAM');

        const data = await getTeamLeaderBoard();
        data.forEach((e, index) => {
            const teamRole = message.guild.roles.cache.get(e.id);
            const podRoleID = podData.pods.find((team) => team.teams.some((_e) => _e.id === teamRole.id)).id;
            const podRole = message.guild.roles.cache.get(podRoleID);
            html = html.replace(`#NAME${index}`, teamRole.name);
            html = html.replace(`#COLOR${index}`, podRole.hexColor);
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
