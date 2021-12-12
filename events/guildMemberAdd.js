const Discord = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const { COLORS, PREFIX, EMAIL_REGEX } = require('../utils/constants');
const { logger } = require('../utils/logger');
const { MESSAGES } = require('./messages/onboarding');
const { sendDissapearingMessage } = require('../utils/functions');
const { addNewMember, getMember, updateBanOrKickMember } = require('../firebase/firebase_handler');
const { sendMail } = require('../utils/mailHandler');
const { checkAuth } = require('../excel/spreadsheet_handler');

module.exports = {
    name: 'guildMemberAdd',

    /**
     * @param {Discord.GuildMember} member
     * @param {Discord.Client} client
     * */
    async execute(member, client) {
        await updateBanOrKickMember(member, { reason: '' }, { reason: '' }, false);
        const user = await getMember(member);
        return;
        if (user.verified) {
            try {
                await member.setNickname(user.name);
            } catch (error) {}
            const serverConfig = client.configs.get(member.guild.id);
            const memberRole = member.guild.roles.cache.get(serverConfig.member_role_id);
            await member.roles.add(memberRole);
            return;
        }
        const serverConfig = client.configs.get(member.guild.id);
        const unverifiedRole = member.guild.roles.cache.get(serverConfig.unverified_role_id);
        await member.roles.add(unverifiedRole);

        const channel = member.guild.channels.cache.get(serverConfig.verification_channel_id);
        this.sendVerify(member, channel);
    },

    /**
     * @param {Discord.GuildMember} member
     * @param {Discord.GuildChannel} channel
     */
    async sendVerify(member, channel) {
        const message = MESSAGES.WELCOME_MESSAGE.replace('@USERNAME', member.user).replace('@USERNAME', member.user);
        try {
            const embed = new Discord.MessageEmbed()
                .setTitle('Verification')
                .setColor(COLORS.cyan)
                .setDescription(
                    [
                        `Check your DM for verification ${member.user}`,
                        "\nIf you haven't recieved the message",
                        `Type \`${PREFIX}verify-me\` here`,
                    ].join('\n')
                )
                .setImage('attachment://help.png');

            await member.send(message);
            await channel.send({
                embed,
                files: [
                    {
                        attachment: './assets/help.png',
                        name: 'help.png',
                    },
                ],
            });
        } catch (error) {
            const embed = new Discord.MessageEmbed()
                .setTitle('I am unable to send you a message for verification')
                .setColor(COLORS.red)
                .setThumbnail(member.user.displayAvatarURL())
                .setDescription(
                    [
                        `${member.user}`,
                        '1. Please go your discord user **settings**',
                        '2. Go to **Privacy & Safety** menu',
                        '3. Enable **Allow direct messages from server members**',
                        `\nAfter that type \`${PREFIX}verify-me\` here`,
                    ].join('\n')
                )
                .setFooter('Feel free to disable the Allow direct messages from server members option after verification');
            await channel.send(embed);
        }
    },

    /**
     * @param {Discord.Message} message
     * @param {Discord.Client} client
     */
    async messageHandler(message, client) {
        let guildID;
        if (PREFIX === '!') guildID = require('../configs/tt-server').id;
        else guildID = require('../configs/test').id;

        const user = client.guilds.cache.get(guildID).members.cache.get(message.author.id);
        let command;
        let args;

        const tempUser = await getMember(user);
        if (tempUser.verified) return;

        if (message.content.toLowerCase().trim() === 'yes') command = 'yes';
        else if (message.content.startsWith(PREFIX)) {
            args = message.content.slice(PREFIX.length).trim().split(' ');
            command = args.shift().toLowerCase();
        } else {
            const possibleMessage = [
                {
                    message: MESSAGES.WELCOME_MESSAGE.replace('@USERNAME', user.user).replace('@USERNAME', user.user),
                    command: 'name',
                },
                {
                    message: MESSAGES.QUESTION_TWO.replace('@ANSWER_NAME', tempUser.name).replace('@ANSWER_NAME', tempUser.name),
                    command: 'email',
                },
                { message: MESSAGES.QUESTION_THREE.replace('@EMAIL', tempUser.email), command: 'verify' },
                { message: MESSAGES.QUESTION_FOUR, command: 'gh' },
                {
                    message: MESSAGES.QUESTION_FIVE.replace('@GITHUB', tempUser.github.replace('https://github.com/', '')),
                    command: 'yes',
                },
            ];
            const previousMessage = (await message.channel.messages.fetch())
                .filter((e) => e.author.bot)
                .filter((e) => e.content !== '')
                .first().content;

            const bestMessage = possibleMessage.find((e) => e.message === previousMessage);
            if (bestMessage === undefined) {
                return message.channel.send(possibleMessage[0].message);
            }

            command = bestMessage.command;
            args = message.content.trim().split(' ');
        }

        try {
            logger.info(`${user.user.tag} is using DM: ${command}`);
            if (command === 'verify-me') {
                return message.channel.send(MESSAGES.WELCOME_MESSAGE.replace('@USERNAME', user).replace('@USERNAME', user));
            }

            if (command === 'name') {
                if (!args[0]) return sendDissapearingMessage(message, '**Invalid Name!**');
                const name = args.join(' ').trim();
                if (!/^[a-zA-Z ]+$/.test(name)) return sendDissapearingMessage(message, '**Invalid Name!**');

                await addNewMember({ user, name });
                try {
                    await user.setNickname(name);
                } catch (error) {}

                const msg = MESSAGES.QUESTION_TWO.replace('@ANSWER_NAME', name).replace('@ANSWER_NAME', name);
                return message.channel.send(msg);
            }

            if (command === 'email') {
                if (!args[0]) return sendDissapearingMessage(message, '**Invalid Email!**');
                const email = args[0].trim();

                if (!EMAIL_REGEX.test(email)) return sendDissapearingMessage(message, '**Invalid Email Entered!**');

                if (!(await checkAuth(email))) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle('⛔ Unauthorized User ⛔')
                        .setColor(COLORS.red)
                        .setDescription(
                            [
                                'Hi, this is an exclusive server for **neoG Camp 2022 students** and team.',
                                'You are not authorised to be a member of this server.',
                                'If you think we are at mistake and you should be a member, then please take a screenshot and mail to _neogcamp@gmail.com_ the issue.',
                            ].join('\n')
                        );
                    return message.channel.send(embed);
                }

                const verificationCode = uuidv4().replace('-', '').slice(0, 10).toLocaleUpperCase();
                await addNewMember({ user, email, verificationCode, verifiedEmail: false });

                let embed = new Discord.MessageEmbed()
                    .setTitle(`Sending verification code to: ${email}`)
                    .setColor(COLORS.yellow)
                    .setDescription('Please wait this might take a few minutes');
                message.channel.send(embed);

                const mailStatus = await sendMail(email, verificationCode);
                if (mailStatus) {
                    const msg = MESSAGES.QUESTION_THREE.replace('@EMAIL', email);
                    return message.channel.send(msg);
                }
                embed = new Discord.MessageEmbed()
                    .setTitle('⛔ **We are experiencing some issues right now** ⛔')
                    .setColor(COLORS.red)
                    .setDescription(MESSAGES.ERROR_MAIL);
                return message.channel.send(embed);
            }

            if (command === 'verify') {
                if (!args[0]) return sendDissapearingMessage(message, '**Invalid Verification Code Entered!**');
                const verificationCode = args[0].trim();
                if ((await getMember(user)).verificationCode === verificationCode) {
                    await addNewMember({ user, verifiedEmail: true });
                    const msg = MESSAGES.QUESTION_FOUR;
                    return message.channel.send(msg);
                }
                return sendDissapearingMessage(message, '**Invalid Verification Code Entered!**');
            }

            if (command === 'gh') {
                if (!args[0]) return sendDissapearingMessage(message, '**Invalid GitHub ID Entered!**');
                const github = args[0].trim().toLowerCase().replace('https://github.com/', '');

                const gitURL = `https://github.com/${github}`;
                const response = await fetch(gitURL);
                const invalidWords = ['no', 'not', 'i', 'na', '.', 'im', 'nil', 'what'];
                const invalidGithubId = invalidWords.some((e) => e === github);

                if (response.status === 200 && !invalidGithubId && github.length !== 0) {
                    await addNewMember({ user, github: gitURL });
                    const msg = MESSAGES.QUESTION_FIVE.replace('@GITHUB', github);
                    return message.channel.send(msg);
                }
                return sendDissapearingMessage(message, '**Invalid GitHub ID Entered!**');
            }

            if (command === 'yes') {
                const commandMessage = message.content.toLowerCase().trim();
                if (commandMessage !== 'yes' && commandMessage !== `${PREFIX}yes`) {
                    return sendDissapearingMessage(message, 'You must say `yes` to the code of conduct to move forward');
                }
                const person = await getMember(user);

                if (person.email === 'Not Provided' || person.name === 'Not Provided' || !person.verifiedEmail) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(COLORS.red)
                        .setThumbnail(user.user.displayAvatarURL())
                        .addField(`${user.user.tag}`, `${user.user}`)
                        .addField('Email:', person.email)
                        .addField('GitHub:', person.github)
                        .addField('Email Verified:', person.verifiedEmail ? ':white_check_mark:' : ':x:')
                        .setFooter('Please fill in the required fields');
                    return message.channel.send(embed);
                }

                const serverConfig = client.configs.get(guildID);
                await user.roles.add(serverConfig.member_role_id);
                await user.roles.remove(serverConfig.unverified_role_id);

                await addNewMember({ user, verified: true });

                const msg = MESSAGES.FINAL;
                await message.channel.send(msg);

                const guild = client.guilds.cache.get(guildID);
                const channel = guild.channels.cache.get(serverConfig.welcome_channel_id);

                logger.info(`${guild.name}:A new member just arrived: ${user.user.tag}`);
                const embed = new Discord.MessageEmbed({
                    title: 'A new member just arrived!',
                    description: [
                        `Welcome ${user.nickname ? user.nickname : user.displayName} we hope you enjoy your stay here!`,
                        '\nI am neoG22 Bot',
                    ].join('\n'),
                    thumbnail: { url: user.user.displayAvatarURL() },
                    color: COLORS.cyan,
                });
                channel.send(embed);
            }
        } catch (e) {
            logger.error(`Command: ${command} Error:`, e);
            const embed = new Discord.MessageEmbed({
                title: 'Error Occured',
                description: 'Check your commands',
                color: COLORS.red,
            });
            return message.channel.send(embed).then((msg) => {
                msg.delete({ timeout: 5000 });
            });
        }
    },
};
