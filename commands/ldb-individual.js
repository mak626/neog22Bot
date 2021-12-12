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
        let html = fs.readFileSync('./assets/individual_leaderboard.html', { encoding: 'utf-8' });

        const data = await getIndividualLeaderBoard();
        data.forEach((e, index) => {
            const user = message.guild.members.cache.get(e.id);
            const podRole = message.guild.roles.cache.get(e.podID);
            html = html.replace(`#SRC${index}`, user.user.displayAvatarURL());
            html = html.replace(`#NAME${index}`, e.name);
            html = html.replace(`#TAGNAME${index}`, user.user.tag);
            html = html.replace(`#POINT${index}`, e.total_points);
            html = html.replace(`#COLOR${index}`, podRole.hexColor);
        });
        if (data.length >= 3) {
            await nodeHtmlToImage({
                output: path,
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
