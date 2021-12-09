const Discord = require('discord.js');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');
const { PREFIX, COLORS } = require('../utils/constants');
const { getLeaderBoard } = require('../firebase/firebase_handler');

module.exports = {
    name: 'leaderboard',
    usage: `${PREFIX}leaderboard`,
    description: 'Shows the leaderboard of Grattitude',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        const path = './assets/image.png';
        let html = fs.readFileSync('./assets/leaderboard.html', { encoding: 'utf-8' });

        const data = await getLeaderBoard();
        data.forEach((e, index) => {
            const user = message.guild.members.cache.get(e.id);
            html = html.replace(`#SRC${index}`, user.user.displayAvatarURL());
            html = html.replace(`#NAME${index}`, e.name);
            html = html.replace(`#TAGNAME${index}`, user.user.tag);
            html = html.replace(`#POINT${index}`, e.points);
        });
        if (data.length >= 3) {
            await nodeHtmlToImage({
                output: './assets/image.png',
                puppeteerArgs: {
                    executablePath: process.env.CHROME_BIN || null,
                    args: ['--no-sandbox', '--headless', '--disable-gpu'],
                },
                html,
            });

            await message.channel.send('', { files: [path] });
            return message.channel.send(`Use \`${PREFIX}myhelprank\` command to see where you stand in helping your community`);
        }
        const embed = new Discord.MessageEmbed()
            .setColor(COLORS.red)
            .setTitle('LeaderBoard is being prepared')
            .setDescription(`Use \`${PREFIX}myhelprank\` command to see where you stand in helping your community`);
        return message.channel.send(embed);
    },
};
