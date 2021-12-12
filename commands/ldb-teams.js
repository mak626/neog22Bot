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
        const hbs = fs.readFileSync('./views/teampod_leaderboard.hbs', { encoding: 'utf-8' });

        let data = await getTeamLeaderBoard();
        data = data.map((e, index) => {
            const teamRole = message.guild.roles.cache.get(e.id);
            const podRoleID = podData.pods.find((team) => team.teams.some((_e) => _e.id === teamRole.id)).id;
            const podRole = message.guild.roles.cache.get(podRoleID);
            return {
                index: index + 1,
                name: teamRole.name,
                color: podRole.hexColor,
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
            content: { type: 'Team', team: data },
        });

        return message.channel.send('', { files: [path] });
    },
};
