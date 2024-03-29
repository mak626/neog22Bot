const Discord = require('discord.js');
const { sendDissapearingMessage } = require('../utils/functions');
const { updateDatabase } = require('../excel/spreadsheet_handler');
const { getMember, getAllMember } = require('../firebase/firebase_handler');
const { PREFIX, COLORS } = require('../utils/constants');

module.exports = {
    name: 'update-database',
    admin: true,
    usage: `${PREFIX}update-database`,
    description: 'CAUTION: Adds current list of users to "Database" excel sheet and firebase.',

    /**
     * @param {Discord.Message} message
     */
    async execute(message) {
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return sendDissapearingMessage(message, `:x: You do not have permission to update database ${message.author}`);
        }

        const data = [['ID', 'Discord ID', 'Name', 'Email', 'Github', 'Verified']];
        let roles = message.guild.roles.cache.sort().map((e) => e.name);
        roles = this.filter(roles);

        data[0].push(...roles);

        const members = (await message.guild.members.fetch()).array();

        let embed = new Discord.MessageEmbed()
            .setTitle(':arrows_counterclockwise: Database is being updated')
            .setColor(COLORS.cyan)
            .setFooter('This may take a few minutes');

        message.channel.send(embed);

        const firebaseData = await getAllMember();

        for (let i = 0; i < members.length; i++) {
            if (members[i].user.bot) continue;
            let user;
            user = firebaseData.find((e) => e.id === members[i].id);
            if (!user) user = await getMember(members[i]);

            const userData = [user.id, user.discordID, user.name, user.email, user.github, user.verified];

            roles.forEach((role) => {
                if (members[i].roles.cache.find((_role) => _role.name === role) !== undefined) userData.push('TRUE');
                else userData.push('FALSE');
            });

            data.push(userData);
        }

        await updateDatabase(data);

        embed = new Discord.MessageEmbed()
            .setTitle(':white_check_mark: Database Updated')
            .setColor(COLORS.green)
            .setDescription('Users to "Database" excel sheet and firebase');
        message.channel.send(embed);
    },

    /**
     * @param {Array} data
     * @returns {Array}
     */
    filter(data) {
        let newData = data;
        const unwanted = [
            '@everyone',
            'member',
            'rythm',
            'serverstats',
            'bot',
            'hydra',
            'neog 2022 bot',
            'neogcamp bot',
            'mee6',
            'superadmins',
            'admins',
        ];

        unwanted.forEach((role) => {
            newData = newData.filter((e) => e.toLowerCase() !== role);
        });

        return newData;
    },
};
