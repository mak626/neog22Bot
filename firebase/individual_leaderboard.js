/* eslint-disable camelcase */
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
 * @typedef {import('../utils/models/PodLeaderBoard').LeaderboardCategoryType} LeaderboardCategory
 */

/** @type {IndividualLeaderBoard[]} */
const firebaseIndividualLeaderboard = [];

// LEADERBOARD FUNCTIONS  ----------------------

/**
 * Gets the user in leaderboard
 * @param {Discord.GuildMember} user
 * @returns {Promise<IndividualLeaderBoard> | undefined}
 */
exports.getUserLeaderBoard = async (user) => {
    let leaderBoard = firebaseIndividualLeaderboard;
    leaderBoard = leaderBoard.sort((a, b) => b.total_points - a.total_points);
    const rank = leaderBoard.findIndex((e) => e.id === user.id);
    if (rank !== -1) return { ...leaderBoard[rank], rank: rank + 1 };
    return undefined;
};

/**
 * Gets the indiviual leaderboard
 * @returns {Promise<IndividualLeaderBoard[]>}
 */
exports.getIndividualLeaderBoard = async () => {
    let leaderBoard = firebaseIndividualLeaderboard;
    leaderBoard = leaderBoard.sort((a, b) => b.total_points - a.total_points).slice(0, 3);
    return leaderBoard;
};

/**
 * Gets the category leaderboard
 * @param {string} podId
 * @returns {Promise<LeaderboardCategory>}
 */
exports.getCategoryLeaderBoard = async (podId) => {
    let leaderBoard = firebaseIndividualLeaderboard;
    if (podId) leaderBoard = leaderBoard.filter((e) => e.podID === podId);

    const data = {
        total: leaderBoard.filter((e) => e.total_points).sort((a, b) => b.total_points - a.total_points)[0],
        review: leaderBoard.filter((e) => e.review_points).sort((a, b) => b.review_points - a.review_points)[0],
        blog: leaderBoard.filter((e) => e.blog_points).sort((a, b) => b.blog_points - a.blog_points)[0],
        debug: leaderBoard.filter((e) => e.debug_points).sort((a, b) => b.debug_points - a.debug_points)[0],
        project: leaderBoard.filter((e) => e.project_points).sort((a, b) => b.project_points - a.project_points)[0],
        concept: leaderBoard.filter((e) => e.concept_points).sort((a, b) => b.concept_points - a.concept_points)[0],
        meme: leaderBoard.filter((e) => e.meme_points).sort((a, b) => b.meme_points - a.meme_points)[0],
    };

    return data;
};

/**
 * Gets the indiviual gratitude leaderboard
 * @returns {Promise<IndividualLeaderBoard[]>}
 */
exports.getGrattidueLeaderBoard = async () => {
    let leaderBoard = firebaseIndividualLeaderboard;
    leaderBoard = leaderBoard.sort((a, b) => b.grattitude_points - a.grattitude_points).slice(0, 3);
    return leaderBoard;
};

/**
 * Updates points of user in Leaderboard
 * @param {Discord.GuildMember} user
 * @param {Points}  givenPoints
 */
exports.updateIndividualLeaderboard = async (
    user,
    {
        total_points = 0,
        review_points = 0,
        blog_points = 0,
        debug_points = 0,
        project_points = 0,
        concept_points = 0,
        meme_points = 0,
        grattitude_points = 0,
    }
) => {
    realtimeDb
        .ref(`individual/${user.id}`)
        .get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const teamRole = user.roles.cache.find((e) => teams[e.id]);
                const podRole = podData.pods.find((e) => e.teams.some((_e) => _e.id === teamRole.id));
                realtimeDb.ref(`individual/${user.id}`).set({
                    ...data,
                    teamID: teamRole.id,
                    podID: podRole.id,
                    total_points: data.total_points + total_points,
                    review_points: data.review_points + review_points,
                    blog_points: data.blog_points + blog_points,
                    debug_points: data.debug_points + debug_points,
                    project_points: data.project_points + project_points,
                    concept_points: data.concept_points + concept_points,
                    meme_points: data.meme_points + meme_points,
                    grattitude_points: data.grattitude_points + grattitude_points,
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
                    total_points,
                    review_points,
                    blog_points,
                    debug_points,
                    project_points,
                    concept_points,
                    meme_points,
                    grattitude_points,
                };
                realtimeDb.ref(`individual/${user.id}`).set(data);
            }
        })
        .catch((error) => {
            console.error(`Firebase Realtime: ${error}`);
        });
    const teamRole = user.roles.cache.find((e) => teams[e.id]);
    await updateTeamLeaderboard(teamRole, total_points);
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
