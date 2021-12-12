// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { logger } = require('../utils/logger');
const { realtimeDb } = require('./firebase_handler');

const firebasePodLeaderboard = [];

/**
 * @typedef {import('../utils/models/PodLeaderBoard').PodLeaderBoard} PodLeaderBoard
 */

/**
 * Gets the pod leaderboard
 * @returns {Promise<PodLeaderBoard[]>}
 */
exports.getPodLeaderBoard = async () => {
    let leaderBoard = firebasePodLeaderboard;
    leaderBoard = leaderBoard.sort((a, b) => b.points - a.points);
    return leaderBoard;
};

/**
 * Updates points of user in Leaderboard
 * @param {Discord.Role} podRole
 * @param {number} points
 */
exports.updatePodLeaderboard = async (podRole, points) => {
    realtimeDb
        .ref(`pods/${podRole.id}`)
        .get()
        .then((snapshot) => {
            const data = snapshot.val();
            realtimeDb.ref(`pods/${podRole.id}`).set({
                ...data,
                points: data.points + points,
            });
        })
        .catch((error) => {
            console.error(`Firebase Realtime: ${error}`);
        });
};

const listenForPodLeaderBoardChanges = async () => {
    logger.firebase('Listening for pod leaderboard changes');

    realtimeDb.ref('pods').on('child_added', (dataSnapshot) => {
        /** @type {PodLeaderBoard} */
        const data = dataSnapshot.val();
        firebasePodLeaderboard.push(data);
        logger.firebase(`Added ${data.name} to POD leaderboard Array`);
    });

    realtimeDb.ref('pods').on('child_changed', (dataSnapshot) => {
        /** @type {PodLeaderBoard} */
        const data = dataSnapshot.val();
        const index = firebasePodLeaderboard.findIndex((e) => e.id === data.id);
        firebasePodLeaderboard[index] = data;
        logger.firebase(`Updated ${data.name} in POD leaderboard Array`);
    });
};

listenForPodLeaderBoardChanges();
