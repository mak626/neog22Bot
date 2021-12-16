// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');
const { PREFIX } = require('../utils/constants');
const { getCategoryLeaderBoard } = require('../firebase/individual_leaderboard');
const { checkRole, sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'ldb-category',
    usage: `${PREFIX}ldb-category [@role]`,
    description: 'Shows the category individual leaderboard',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     */
    async execute(message) {
        const path = './assets/category_image.png';
        const hbs = fs.readFileSync('./views/category_leaderboard.hbs', { encoding: 'utf-8' });

        let roleId;
        if (message.mentions.roles.first()) {
            const { podRole } = await checkRole(message.mentions.roles.first());
            if (!podRole) return sendDissapearingMessage(message, `You didn't tag a pod role, ${message.author}!`);
            roleId = message.mentions.roles.first().id;
        }
        const data = await getCategoryLeaderBoard(roleId);

        const category = [
            {
                type: 'Overall',
                name: data.total ? message.guild.members.cache.get(data.total.id).user.username : undefined,
                tagName: data.total ? message.guild.members.cache.get(data.total.id).user.tag : undefined,
                points: data.total ? data.total.total_points : 0,
                src: data.total ? message.guild.members.cache.get(data.total.id).user.displayAvatarURL() : undefined,
                color: data.total ? message.guild.roles.cache.get(data.total.podID).hexColor : 'white',
            },
            {
                type: 'Review',
                name: data.review ? message.guild.members.cache.get(data.review.id).user.username : undefined,
                tagName: data.review ? message.guild.members.cache.get(data.review.id).user.tag : undefined,
                points: data.review ? data.review.review_points : 0,
                src: data.review ? message.guild.members.cache.get(data.review.id).user.displayAvatarURL() : undefined,
                color: data.review ? message.guild.roles.cache.get(data.review.podID).hexColor : 'white',
            },
            {
                type: 'Blog',
                name: data.blog ? message.guild.members.cache.get(data.blog.id).user.username : undefined,
                tagName: data.blog ? message.guild.members.cache.get(data.blog.id).user.tag : undefined,
                points: data.blog ? data.blog.blog_points : 0,
                src: data.blog ? message.guild.members.cache.get(data.blog.id).user.displayAvatarURL() : undefined,
                color: data.blog ? message.guild.roles.cache.get(data.blog.podID).hexColor : 'white',
            },
            {
                type: 'Debug',
                name: data.debug ? message.guild.members.cache.get(data.debug.id).user.username : undefined,
                tagName: data.debug ? message.guild.members.cache.get(data.debug.id).user.tag : undefined,
                points: data.debug ? data.debug.debug_points : 0,
                src: data.debug ? message.guild.members.cache.get(data.debug.id).user.displayAvatarURL() : undefined,
                color: data.debug ? message.guild.roles.cache.get(data.debug.podID).hexColor : 'white',
            },
            {
                type: 'Project',
                name: data.project ? message.guild.members.cache.get(data.project.id).user.username : undefined,
                tagName: data.project ? message.guild.members.cache.get(data.project.id).user.tag : undefined,
                points: data.project ? data.project.project_points : 0,
                src: data.project ? message.guild.members.cache.get(data.project.id).user.displayAvatarURL() : undefined,
                color: data.project ? message.guild.roles.cache.get(data.project.podID).hexColor : 'white',
            },
            {
                type: 'Concept',
                name: data.concept ? message.guild.members.cache.get(data.concept.id).user.username : undefined,
                tagName: data.concept ? message.guild.members.cache.get(data.concept.id).user.tag : undefined,
                points: data.concept ? data.concept.concept_points : 0,
                src: data.concept ? message.guild.members.cache.get(data.concept.id).user.displayAvatarURL() : undefined,
                color: data.concept ? message.guild.roles.cache.get(data.concept.podID).hexColor : 'white',
            },
            {
                type: 'Memer',
                name: data.meme ? message.guild.members.cache.get(data.meme.id).user.username : undefined,
                tagName: data.meme ? message.guild.members.cache.get(data.meme.id).user.tag : undefined,
                points: data.meme ? data.meme.meme_points : 0,
                src: data.meme ? message.guild.members.cache.get(data.meme.id).user.displayAvatarURL() : undefined,
                color: data.meme ? message.guild.roles.cache.get(data.meme.podID).hexColor : 'white',
            },
        ];

        await nodeHtmlToImage({
            output: path,
            puppeteerArgs: {
                executablePath: process.env.CHROME_BIN || null,
                args: ['--no-sandbox', '--headless', '--disable-gpu'],
            },
            html: hbs,
            selector: 'body > div > div',
            content: { category },
        });

        await message.channel.send('', { files: [path] });
        return message.channel.send(`Use \`${PREFIX}myrank\` command to see where you stand in helping your community`);
    },
};
