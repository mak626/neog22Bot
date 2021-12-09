// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { addOffenceEmojiAction } = require('../firebase/firebase_handler');
const { logger } = require('../utils/logger');

module.exports = {
    name: 'messageReactionAdd',

    /**
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User | Discord.PartialUser} user
     */
    async execute(reaction, user) {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        if (reaction.emoji.name === '🖕') {
            const PARAM_1 = reaction.message.guild.id;
            const PARAM_2 = reaction.message.channel.id;
            const PARAM_3 = reaction.message.id;
            logger.info(`${user.username} has commited offence by reacting 🖕`);
            const person = reaction.message.guild.members.cache.get(user.id);
            await addOffenceEmojiAction(person, [PARAM_1, PARAM_2, PARAM_3].join('/'), reaction);
            reaction.message.reactions.resolve(reaction.emoji.name).users.remove(user);
        }
    },
};
