const Discord = require('discord.js');
const fs = require('fs');
const { logger } = require('./logger');
const { COLORS } = require('./constants');
const podData = require('../assets/data/pod_static.json');
require('dotenv').config();

module.exports = {
    /**
     * @param {Discord.Message} message
     * @param {string} roleID
     */
    findRoleById(message, roleID) {
        return message.guild.roles.cache.get(roleID);
    },

    /**
     * @param {Discord.Message} message
     * @param {string} roleName
     */
    findRoleByName(message, roleName) {
        return message.guild.roles.cache.find((role) => role.name === roleName);
    },

    /**
     * @param {Discord.Message} message
     * @param {string} channelID
     */
    findChannelById(message, channelID) {
        return message.guild.channels.cache.get(channelID);
    },

    /**
     * @param {Discord.Message} message
     * @param {string} channelName
     */
    findChannelByName(message, channelName) {
        return message.guild.channels.cache.find((category) => category.name === channelName);
    },

    /** @param {string[]} data String Data Array */
    findBestMessageSize(data) {
        let BEST_LENGTH = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const orginalSize = data.slice(0, data.length).join('\n').length;
            const size = data.slice(0, Math.min(data.length, BEST_LENGTH)).join('\n').length;
            if (orginalSize <= 3500) {
                BEST_LENGTH = orginalSize;
                break;
            }
            if (size >= 3500) {
                BEST_LENGTH -= 1;
                break;
            }
            BEST_LENGTH += 1;
        }
        return BEST_LENGTH;
    },

    /**
     * @param {Discord.Message} message
     * @param {string} content
     * @param {string} [color] default = COLORS.red
     * @param {Number} [timeout] default = 30000
     */
    async sendDissapearingMessage(message, content, color, timeout) {
        const embed = new Discord.MessageEmbed({
            description: content,
            color: color || COLORS.red,
        });
        const msg = await message.channel.send(embed);
        try {
            await msg.delete({ timeout: timeout || 30000 });
        } catch (e) {
            logger.warn('Tried deleting a message that has already been deleted');
        }
        try {
            await message.delete();
        } catch (e) {
            logger.warn('Tried deleting a message that has already been deleted');
        }
    },

    /**
     * Checks whether given role is a team/pod role
     * @param {Discord.Role} role
     * @returns {{podRole: boolean;teamRole:boolean}}
     */
    async checkRole(role) {
        const podRole = podData.pods.find((e) => e.id === role.id);
        if (podRole) return { podRole: true, teamRole: false };

        let teamRole;
        podData.pods.some((e) => {
            teamRole = e.teams.find((_e) => _e.id === role.id);
            if (teamRole) return true;
            return false;
        });

        if (teamRole) return { podRole: false, teamRole: true };
        return { podRole: false, teamRole: false };
    },

    /**
     * Dumps the given fileName to as a json
     * @param {string} fileName
     * @param {object} records
     */
    createFile(fileName, records) {
        fs.writeFile(`${__dirname.replace('utils', '')}/assets/dump/${fileName}.json`, JSON.stringify(records, null, 4), (err) => {
            if (err) {
                logger.log(err);
            }
        });
    },
};
