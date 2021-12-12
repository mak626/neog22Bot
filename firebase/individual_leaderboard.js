// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { logger } = require('../utils/logger');
const { realtimeDb } = require('./firebase_handler');
const { teams } = require('../assets/data/teams_static.json');
const podData = require('../assets/data/pod_static.json');
const { updateTeamLeaderboard } = require('./team_leaderboard');
/**
 * @typedef {import('../utils/models/PodLeaderBoard').IndividualLeaderBoard} IndividualLeaderBoard
 * @typedef {import('../utils/models/PodLeaderBoard').Points} Points
 */

/** @type {IndividualLeaderBoard[]} */
const firebaseIndividualLeaderboard = [];

/**
 * Gets the indiviual leaderboard
 * @param {string} type
 * @returns {Promise<IndividualLeaderBoard[]>}
 */
exports.getIndividualLeaderBoard = async (type) => {
    let leaderBoard = firebaseIndividualLeaderboard;
    leaderBoard = leaderBoard.sort((a, b) => b.total_points - a.total_points).slice(0, 3);
    return leaderBoard;
};

/**
 * Updates points of user in Leaderboard
 * @param {Discord.GuildMember} user
 * @param {Points} pointsData
 */
exports.updateIndividualLeaderboard = async (user, pointsData) => {
    realtimeDb
        .ref(`individual/${user.id}`)
        .get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                realtimeDb.ref(`individual/${user.id}`).set({
                    ...data,
                    total_points: data.total_points + pointsData.total_points,
                    review_points: data.review_points + pointsData.review_points,
                    blog_points: data.blog_points + pointsData.blog_points,
                    debug_points: data.debug_points + pointsData.debug_points,
                    project_points: data.project_points + pointsData.project_points,
                    concept_points: data.concept_points + pointsData.concept_points,
                    meme_points: data.meme_points + pointsData.meme_points,
                });
            } else {
                const teamRole = user.roles.cache.find((e) => teams[e.id]);
                const podRole = podData.pods.find((e) => e.teams.some((_e) => _e.id === teamRole.id));
                const data = {
                    id: user.id,
                    name: user.nickname ? user.nickname : user.displayName,
                    discordID: user.user.tag,
                    teamID: teamRole.id,
                    podID: podRole.id,
                    total_points: pointsData.total_points,
                    review_points: pointsData.review_points,
                    blog_points: pointsData.blog_points,
                    debug_points: pointsData.debug_points,
                    project_points: pointsData.project_points,
                    concept_points: pointsData.concept_points,
                    meme_points: pointsData.meme_points,
                };
                realtimeDb.ref(`individual/${user.id}`).set(data);
            }
        })
        .catch((error) => {
            console.error(`Firebase Realtime: ${error}`);
        });
    const teamRole = user.roles.cache.find((e) => teams[e.id]);
    await updateTeamLeaderboard(teamRole, pointsData.total_points);
};

const listenForIndividualLeaderBoardChanges = async () => {
    logger.firebase('Listening for Individual leaderboard changes');

    realtimeDb.ref('individual').on('child_added', (dataSnapshot) => {
        /** @type {IndividualLeaderBoard} */
        const data = dataSnapshot.val();
        firebaseIndividualLeaderboard.push(data);
        // logger.firebase(`Added ${data.name} to Individual leaderboard Array`);
    });

    realtimeDb.ref('individual').on('child_changed', (dataSnapshot) => {
        /** @type {IndividualLeaderBoard} */
        const data = dataSnapshot.val();
        const index = firebaseIndividualLeaderboard.findIndex((e) => e.id === data.id);
        firebaseIndividualLeaderboard[index] = data;
        // logger.firebase(`Updated ${data.name} in Individual leaderboard Array`);
    });
};

listenForIndividualLeaderBoardChanges();
