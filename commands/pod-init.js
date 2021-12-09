const Discord = require('discord.js');
const { PREFIX } = require('../utils/constants');
const { findRoleById, sendDissapearingMessage } = require('../utils/functions');

module.exports = {
    name: 'pod-init',
    admin: true,
    usage: `${PREFIX}pod-init <NO_OF PODS>`,
    description: 'Creates Given <NO_OF_PODS> with permissions',

    /**
     * @param {Discord.Message} message
     * @param {string[]} args
     * @param {Discord.Client} client
     */
    async execute(message, args, client) {
        const POD_NO = parseInt(args[0], 10);
        if (!message.member.hasPermission('MANAGE_CHANNELS')) {
            return sendDissapearingMessage(message, `You are not wise enough to make those channels my friend ${message.author}`);
        }
        if (args.length < 1) {
            return sendDissapearingMessage(message, `Check your arguments, ${message.author}!`);
        }
        if (Number.isNaN(POD_NO)) {
            return sendDissapearingMessage(message, `You didn't specify a number, ${message.author}!`);
        }

        const serverConfig = client.configs.get(message.guild.id);
        const memberRole = findRoleById(message, serverConfig.member_role_id);
        const paRole = findRoleById(message, serverConfig.pa_role_id);
        const taRole = findRoleById(message, serverConfig.ta_role_id);
        const maRole = findRoleById(message, serverConfig.ma_role_id);
        const caRole = findRoleById(message, serverConfig.ca_role_id);

        const role = message.guild.roles;
        const channel = message.guild.channels;
        let teamNo = 0;

        for (let i = 0; i < POD_NO; i++) {
            const podRole = await role.create({
                data: { name: `POD ${i + 1}`, permissions: memberRole.permissions },
            });

            const generalPermissions = [
                {
                    id: podRole.id,
                    allow: ['VIEW_CHANNEL'],
                },
                {
                    id: role.everyone,
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'],
                },
                {
                    id: paRole.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'],
                },
                {
                    id: maRole.id,
                    allow: ['SEND_MESSAGES', 'CONNECT'],
                },
                {
                    id: caRole.id,
                    allow: ['SEND_MESSAGES', 'CONNECT'],
                },
                {
                    id: taRole.id,
                    allow: ['SEND_MESSAGES', 'CONNECT'],
                },
            ];

            const podCategory = await channel.create(`POD ${i + 1}`, {
                type: 'category',
                permissionOverwrites: generalPermissions,
            });

            const params = {
                parent: podCategory.id,
                permissionOverwrites: generalPermissions,
            };

            const paramsStudents = {
                parent: podCategory.id,
                permissionOverwrites: [
                    {
                        id: podRole.id,
                        allow: ['VIEW_CHANNEL'],
                    },
                    {
                        id: role.everyone,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: paRole.id,
                        allow: ['VIEW_CHANNEL'],
                    },
                    {
                        id: maRole.id,
                    },
                    {
                        id: caRole.id,
                    },
                    {
                        id: taRole.id,
                    },
                ],
            };

            await channel.create(`pod-${i + 1}`, {
                type: 'news',
                ...params,
            });

            await channel.create(`pod ${i + 1}-voice`, {
                type: 'voice',
                ...paramsStudents,
            });

            await channel.create(`pod-${i + 1}-general`, {
                type: 'text',
                ...paramsStudents,
            });

            const limit = teamNo + 4;
            for (; teamNo < limit; teamNo++) {
                const teamRole = await role.create({
                    data: { name: `Team ${teamNo + 1}`, permissions: memberRole.permissions },
                });
                const teamCaptainRole = await role.create({
                    data: { name: `Team ${teamNo + 1} Captain`, permissions: memberRole.permissions },
                });

                const teamParams = {
                    parent: podCategory.id,
                    permissionOverwrites: [
                        ...generalPermissions,
                        {
                            id: teamRole.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'],
                        },
                        {
                            id: teamCaptainRole.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'],
                        },
                    ],
                };

                await channel.create(`team-${teamNo + 1}`, {
                    type: 'text',
                    ...teamParams,
                });

                await channel.create(`team ${teamNo + 1}`, {
                    type: 'voice',
                    ...teamParams,
                });

                await channel.create(`team-${teamNo + 1}-daily-standup`, {
                    type: 'text',
                    ...teamParams,
                });
            }
        }
    },
};
