const Discord = require('discord.js');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');
const { PREFIX, COLORS } = require('../utils/constants');
const { getGrattidueLeaderBoard } = require('../firebase/individual_leaderboard');

module.exports = {
    name: 'ldb-gratitude',
    usage: `${PREFIX}ldb-gratitude`,
    description: 'Shows the leaderboard of Gratitude',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        const path = './assets/image.png';
        const hbs = fs.readFileSync('./views/individual_leaderboard.hbs', { encoding: 'utf-8' });

        let data = await getGrattidueLeaderBoard();
        const orderColors = [{ color: '#f1c40f' }, { color: '#3498db' }, { color: '#2ecc71' }];
        data = data.map((e, index) => {
            const user = message.guild.members.cache.get(e.id);
            return {
                index: index + 1,
                name: user.user.username,
                tagName: user.user.tag,
                src: user.user.displayAvatarURL(),
                color: orderColors[index].color,
                points: e.grattitude_points,
            };
        });

        if (data.length >= 3) {
            await nodeHtmlToImage({
                output: path,
                puppeteerArgs: {
                    executablePath: process.env.CHROME_BIN || null,
                    args: ['--no-sandbox', '--headless', '--disable-gpu'],
                },
                html: hbs,
                selector: 'body > div > div',
                content: { type: 'Gratitude', person: data },
            });

            await message.channel.send('', { files: [path] });
            return message.channel.send(`Use \`${PREFIX}myrank\` command to see where you stand in helping your community`);
        }
        const embed = new Discord.MessageEmbed()
            .setColor(COLORS.red)
            .setTitle('LeaderBoard is being prepared')
            .setDescription(`Use \`${PREFIX}myrank\` command to see where you stand in helping your community`);
        return message.channel.send(embed);
    },
};
