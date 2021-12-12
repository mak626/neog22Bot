const Discord = require('discord.js');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');
const { PREFIX, COLORS } = require('../utils/constants');
const { getIndividualLeaderBoard } = require('../firebase/individual_leaderboard');

module.exports = {
    name: 'ldb-individual',
    usage: `${PREFIX}ldb-individual`,
    description: 'Shows the individual leaderboard',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        const path = './assets/individual_image.png';
        const hbs = fs.readFileSync('./views/individual_leaderboard.hbs', { encoding: 'utf-8' });

        let data = await getIndividualLeaderBoard();
        data = data.map((e) => {
            const user = message.guild.members.cache.get(e.id);
            const podRole = message.guild.roles.cache.get(e.podID);
            return {
                name: e.name,
                tagName: user.user.tag,
                src: user.user.displayAvatarURL(),
                color: podRole.hexColor,
                points: e.total_points,
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
                content: { type: 'Individual', person: data },
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
