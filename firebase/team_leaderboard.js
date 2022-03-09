// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { logger } = require('../utils/logger');
const { realtimeDb } = require('./firebase_handler');
const { updatePodLeaderboard } = require('./pod_leaderboard');
const podData = require('../assets/data/pod_static.json');

/**
 * @typedef {import('../types/PodLeaderBoard').TeamLeaderBoard} TeamLeaderBoard
 */

/** @type {TeamLeaderBoard[]} */
const firebaseTeamLeaderboard = [];

/**
 * Gets the team leaderboard
 * @returns {Promise<TeamLeaderBoard[]>}
 */
exports.getTeamLeaderBoard = async () => {
    let leaderBoard = firebaseTeamLeaderboard;
    leaderBoard = leaderBoard.sort((a, b) => b.points - a.points).slice(0, 4);
    return leaderBoard;
};

/**
 * Updates points of user in Leaderboard
 * @param {Discord.Role} teamRole
 * @param {number} points
 */
exports.updateTeamLeaderboard = async (teamRole, points) => {
    realtimeDb
        .ref(`teams/${teamRole.id}`)
        .get()
        .then((snapshot) => {
            const data = snapshot.val();
            realtimeDb.ref(`teams/${teamRole.id}`).set({
                ...data,
                points: data.points + points,
            });
        })
        .catch((e) => {
            logger.error(`Firebase Realtime: ${e.message} | ${e?.stack}`);
        });
    const podRole = podData.pods.find((e) => e.teams.some((_e) => _e.id === teamRole.id));
    await updatePodLeaderboard(podRole, points);
};

const listenForTeamLeaderBoardChanges = async () => {
    logger.firebase('Listening for team leaderboard changes');

    realtimeDb.ref('teams').on('child_added', (dataSnapshot) => {
        /** @type {TeamLeaderBoard} */
        const data = dataSnapshot.val();
        firebaseTeamLeaderboard.push(data);
        // logger.firebase(`Added ${data.name} to Team leaderboard Array`);
    });

    realtimeDb.ref('teams').on('child_changed', (dataSnapshot) => {
        /** @type {TeamLeaderBoard} */
        const data = dataSnapshot.val();
        const index = firebaseTeamLeaderboard.findIndex((e) => e.id === data.id);
        firebaseTeamLeaderboard[index] = data;
        // logger.firebase(`Updated ${data.name} in Team leaderboard Array`);
    });
};

listenForTeamLeaderBoardChanges();
