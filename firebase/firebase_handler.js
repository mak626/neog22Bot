const admin = require('firebase-admin');
require('dotenv').config();
// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const serviceAccount = JSON.parse(process.env.FIREBASE);
const { logger } = require('../utils/logger');
const { addOffenceSheet } = require('../excel/spreadsheet_handler');

/**
 * @typedef {import('../types/FirebaseUser').FirebaseUser} FirebaseUser
 * @typedef {import('../types/LeaderBoardUser').LeaderBoardUser} LeaderBoardUser
 * @typedef {import('../types/WarnUser').WarnUser} WarnUser
 * @typedef {import('../types/WarnUser').WarnOffence} WarnOffence
 * @typedef {import('../types/SpamLink').SpamLink} SpamLink
 */

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_RTD,
});

const dbFirebase = admin.firestore();
const dbRealtimeDatabase = admin.database();
logger.firebase('Initializing');

exports.realtimeDb = dbRealtimeDatabase;

/** @type {LeaderBoardUser[]} */
exports.firebaseLeaderBoardArray = [];

/** @type {WarnUser[]} */
exports.firebaseWarnArray = [];

/** @type {SpamLink[]} */
exports.firebaseSpamLinkArray = [];

exports.enableVerify = [true];

/** @param {Discord.GuildMember} user  */
const parseUser = (user) => {
    const roleArray = user.roles.cache.map((e) => ({ roleName: e.name, roleID: e.id }));

    return {
        id: user.id,
        name: user.nickname ? user.nickname : user.displayName,
        email: 'Not Provided',
        github: 'Not Provided',
        discordID: user.user.tag,
        roles: roleArray,
        banned: { status: false, reason: '' },
        kicked: { status: false, reason: '' },
        verificationCode: '',
        verified: false,
        verifiedEmail: false,
    };
};

// BAN/KICK USER FUNCTIONS ----------------------

/**
 * Marks a person first and then bans him
 * @param {Discord.GuildMember} user
 * @param {string} messageURL
 * @param {Discord.MessageReaction} reactionMessage
 */
exports.addOffenceEmojiAction = async (user, messageURL, reactionMessage) => {
    /** @type {FirebaseUser} */
    const doc = await this.getMember(user);

    if (doc.banned.reason === '') {
        // First time using bad emoji
        await user.send(
            [
                `Dear ${user},`,
                `We noticed you reacted with "🖕" to this message https://discord.com/channels/${messageURL}.`,
                'We understand that either it is because you are frustrated or sad at this moment with on going hard times,',
                "Or we hope you did it by mistake. Nevertheless, we would like to tell you that we take the well being of this community quite seriously and that's why we have noted your names for the first offence.",
                'If this happens again you will be permanently banned from the server.',
                'Hope it was just a mistake or you might feel better after letting the steam off on this.',
                'Wish you good health.',
            ].join('\n')
        );

        const colRef = dbFirebase.collection('users');
        let data = await this.getMember(user);
        data = {
            ...data,
            banned: { status: false, reason: 'Using offensive emoticons once' },
        };

        if (data.newUser) await colRef.doc(user.id).create(data);
        else await colRef.doc(user.id).update(data);
    } else {
        await user.send(
            [
                `Dear ${user.username},`,
                `We again noticed you reacting with "🖕" to this message https://discord.com/channels/${messageURL}.`,
                'As mentioned earlier we will not tolerate any kind of misbehaviour,',
                ' Your are being `BANNED` from *Team Tanay Community*',
            ].join('\n')
        );
        reactionMessage.message.guild.members.cache.get(user.id).ban({ reason: 'Using offensive emoticons', days: 7 });
    }
};

/**
 * Adds user to blacklist sheet
 * @param {Discord.GuildMember} user
 * @param {Discord.GuildAuditLogsEntry} banned
 * @param {Discord.GuildAuditLogsEntry} kicked
 */
exports.updateBanOrKickMember = async (user, banned, kicked, status) => {
    const colRef = dbFirebase.collection('users');
    let data = await this.getMember(user);
    if (banned) {
        data = { ...data, banned: { status, reason: banned.reason } };
    }
    if (kicked) {
        data = { ...data, kicked: { status, reason: kicked.reason } };
    }

    if (data.newUser) {
        try {
            await colRef.doc(user.id).create(data);
        } catch (error) { }

        if (banned && banned.reason !== '') logger.firebase(`Added ${user.user.tag} to banned: ${banned.reason}`);
        if (kicked && kicked.reason !== '') logger.firebase(`Added ${user.user.tag} to kicked: ${kicked.reason}`);
    } else {
        try {
            await colRef.doc(user.id).update(data);
        } catch (error) { }

        if (banned && banned.reason !== '') logger.firebase(`Updated ${user.user.tag} to banned: ${banned.reason}`);
        if (kicked && kicked.reason !== '') logger.firebase(`Updated ${user.user.tag} to kicked: ${kicked.reason}`);
    }

    addOffenceSheet(data, banned, kicked);
};

// BAN/KICK USER FUNCTIONS : END ----------------------

// USER FUNCTIONS ----------------------

/**
 * Updates roles of given user
 * @param {Discord.GuildMember} user
 */
exports.updateUser = async (user) => {
    const colRef = dbFirebase.collection('users');
    let data = await this.getMember(user);

    if (data.newUser) {
        try {
            await colRef.doc(user.id).create(data);
        } catch (error) { }
        logger.firebase(`Added ${user.user.tag}`);
    } else {
        const roleArray = user.roles.cache.map((e) => ({ roleName: e.name, roleID: e.id }));
        data = {
            name: user.nickname ? user.nickname : data.name,
            discordID: user.user.tag,
            roles: roleArray,
        };
        try {
            await colRef.doc(user.id).update(data);
        } catch (error) { }
        logger.firebase(`Updated ${user.user.tag}`);
    }
};

/**
 * Gets a member data
 * @param {Discord.GuildMember} user
 * @returns {Promise<FirebaseUser>} user
 */
exports.getMember = async (user) => {
    const colRef = dbFirebase.collection('users');
    let data = (await colRef.doc(user.id).get()).data();
    if (!data) {
        data = parseUser(user);
        data = { ...data, newUser: true };
        try {
            await colRef.doc(user.id).create(data);
        } catch (error) { }
    } else {
        data.newUser = false;
    }
    return data;
};

/**
 * Gets all member data
 * @returns {Promise<FirebaseUser[]>} user
 */
exports.getAllMember = async () => {
    const colRef = await dbFirebase.collection('users').get();
    const data = colRef.docs.map((doc) => doc.data());
    return data;
};

/**
 * Adds a new member to firebase
 * @param {Discord.GuildMember} user
 * @param {string} name
 * @param {string} email
 * @param {number} verificationCode
 * @param {string} github
 * @param {boolean} verifiedEmail
 * @param {boolean} verified
 */
exports.addNewMember = async ({ user, name, email, verificationCode, github, verifiedEmail, verified }) => {
    let data = this.getMember(user);
    const colRef = dbFirebase.collection('users');

    if (name) data = { ...data, name };
    if (email) data = { ...data, email };
    if (verificationCode) data = { ...data, verificationCode };
    if (github) data = { ...data, github };
    if (verifiedEmail !== undefined) data = { ...data, verifiedEmail };
    if (verified !== undefined) {
        data = { ...data, newUser: false, verified };
    }
    try {
        await colRef.doc(user.id).update(data);
    } catch (error) { }
};

// USER FUNCTIONS : END ----------------------

// WARN FUNCTIONS  ---------------------

/**
 * Gets the user in warnList
 * @param {Discord.GuildMember} user
 * @returns {Promise<WarnUser>}
 */
exports.getUserWarn = async (user) => {
    const warnUser = this.firebaseWarnArray.find((e) => e.id === user.id);
    return warnUser;
};

/**
 * Adds offense to warn List of a given user and increments count
 * @param {Discord.GuildMember} user
 * @param {WarnOffence} offence
 */
exports.updateWarnUser = async (user, offence) => {
    dbRealtimeDatabase
        .ref(`warn/${user.id}`)
        .get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                /** @type {WarnUser} */
                const data = snapshot.val();
                let offences = [offence];
                if (data.offences) offences = [...data.offences, offence];

                dbRealtimeDatabase.ref(`warn/${user.id}`).set({
                    ...data,
                    count: data.count + 1,
                    offences,
                });
            } else {
                dbRealtimeDatabase.ref(`warn/${user.id}`).set({
                    id: user.id,
                    name: user.nickname ? user.nickname : user.displayName,
                    discordID: user.user.tag,
                    count: 1,
                    offences: [offence],
                });
            }
        })
        .catch((e) => {
            logger.error(`Firebase Realtime: ${e.message} | ${e?.stack}`);
        });
};

/**
 * Resets warn count to 0 for a given user
 * @param {Discord.GuildMember} user
 */
exports.resetWarnUser = async (user) => {
    dbRealtimeDatabase
        .ref(`warn/${user.id}`)
        .get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                /** @type {WarnUser} */
                const data = snapshot.val();
                dbRealtimeDatabase.ref(`warn/${user.id}`).set({
                    ...data,
                    count: 0,
                });
            } else {
                dbRealtimeDatabase.ref(`warn/${user.id}`).set({
                    id: user.id,
                    name: user.nickname ? user.nickname : user.displayName,
                    discordID: user.user.tag,
                    count: 0,
                    offences: [],
                });
            }
        })
        .catch((e) => {
            logger.error(`Firebase Realtime: ${e.message} | ${e?.stack}`);
        });
};

const listenForWarnChanges = async () => {
    logger.firebase('Listening for Warn changes');

    dbRealtimeDatabase.ref('warn').on('child_added', (dataSnapshot) => {
        /** @type {LeaderBoardUser} */
        const data = dataSnapshot.val();
        this.firebaseWarnArray.push(data);
        // logger.firebase(`Added ${data.discordID} to warn Array`);
    });

    dbRealtimeDatabase.ref('warn').on('child_changed', (dataSnapshot) => {
        /** @type {LeaderBoardUser} */
        const data = dataSnapshot.val();
        const index = this.firebaseWarnArray.findIndex((e) => e.id === data.id);
        this.firebaseWarnArray[index] = data;
        // logger.firebase(`Updated ${data.discordID} in warn Array`);
    });
};

// WARN FUNCTIONS : END ----------------------

// SPAM LINK FUNCTIONS  ----------------------

/**
 * Adds spam link to spamLinks
 * @param {string} link
 * @returns {Promise<boolean>} success/failed
 */
exports.addSpamLink = async (link) => {
    const value = this.firebaseSpamLinkArray.find((e) => e.link === link);
    if (value) return false;
    try {
        dbRealtimeDatabase.ref('spamlinks').push().set({ link });
        return true;
    } catch (e) {
        logger.error(`Firebase Realtime: ${e.message} | ${e?.stack}`);
        return false;
    }
};

/**
 * Removes spam link to spamLinks
 * @param {string} link
 * @returns {Promise<boolean>} success/failed
 */
exports.removeSpamLink = async (link) => {
    const value = this.firebaseSpamLinkArray.find((e) => e.link === link);
    if (!value) return false;
    try {
        await dbRealtimeDatabase.ref(`spamlinks/${value.id}`).remove();
        return true;
    } catch (e) {
        logger.error(`Firebase Realtime: ${e.message} | ${e?.stack}`);
        return false;
    }
};

const listenForSpamLinkChanges = async () => {
    logger.firebase('Listening for Spam Link changes');

    dbRealtimeDatabase.ref('spamlinks').on('child_added', (dataSnapshot) => {
        /** @type {SpamLink} */
        const data = dataSnapshot.val();
        this.firebaseSpamLinkArray.push({ ...data, id: dataSnapshot.key });
        // logger.firebase(`Added ${data.link} to spamlink Array`);
    });

    dbRealtimeDatabase.ref('spamlinks').on('child_removed', (dataSnapshot) => {
        /** @type {SpamLink} */
        const data = dataSnapshot.val();
        const index = this.firebaseSpamLinkArray.findIndex((e) => e.link === data.link);
        this.firebaseSpamLinkArray.splice(index, 1);
        // logger.firebase(`Deleted ${data.link} in spamlink Array`);
    });
};

// SPAM LIN FUNCTIONS : END ----------------------

listenForWarnChanges();
listenForSpamLinkChanges();
