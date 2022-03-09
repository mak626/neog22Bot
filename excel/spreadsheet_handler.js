const { google } = require('googleapis');
// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { SPREADSHEET_ID, CREDENTIALS } = require('../utils/constants');

const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

// ----------- Sheet helper functions ----------

/**
 * @typedef {import('../types/FirebaseUser').FirebaseUser} FirebaseUser
 * @typedef {import('../types/LeaderBoardUser').LeaderBoardUser} LeaderBoardUser
 * @typedef {import('../types/WarnUser').WarnUser} WarnUser
 * @typedef {import('../types/WarnUser').WarnOffence} WarnOffence
 */

/**
 * Initializes GoogleSheet
 * @returns {Promise<any[][]>}
 */
async function getSheetValuesByName(rangeName) {
    const client = await auth.getClient();
    const googlesheets = google.sheets({ version: 'v4', auth: client });
    const {
        data: { values },
    } = await googlesheets.spreadsheets.values.get({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range: rangeName,
    });

    return values;
}

/**
 * Adds values to given range
 * @param {string} range
 * @param {any[][]} values
 */
async function appendToSheet(range, values) {
    const client = await auth.getClient();
    const googlesheets = google.sheets({ version: 'v4', auth: client });
    await googlesheets.spreadsheets.values.append({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values,
        },
    });
}

/**
 * Adds values to given range
 * @param {string} range
 * @param {any[][]} values
 */
async function updateSheet(range, values) {
    const client = await auth.getClient();
    const googlesheets = google.sheets({ version: 'v4', auth: client });
    await googlesheets.spreadsheets.values.update({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            majorDimension: 'ROWS',
            range,
            values,
        },
    });
}

/**
 * Clear and then adds values to given range
 * @param {string} range
 * @param {any[][]} values
 */
async function clearAndUpdateSheet(range, values) {
    const client = await auth.getClient();
    const googlesheets = google.sheets({ version: 'v4', auth: client });
    await googlesheets.spreadsheets.values.clear({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range,
    });
    await updateSheet(range, values);
}

// ----------- Sheet helper functions : END ----------

/**
 * Adds offensive emoji message data to blacklist sheet
 * @param {FirebaseUser} user
 * @param {Discord.GuildAuditLogsEntry} banned
 * @param {Discord.GuildAuditLogsEntry} kicked
 */
async function addOffenceSheet(user, banned, kicked) {
    const values = [new Date().toLocaleString(), user.id, user.discordID, user.name, user.email, user.verified ? 'TRUE' : 'FALSE'];
    if (banned && banned.reason !== '') await appendToSheet('Blacklist!A:H', [[...values, 'BAN', banned.reason]]);
    if (kicked && kicked.reason !== '') await appendToSheet('Blacklist!A:H', [[...values, 'KICK', kicked.reason]]);
}

/**
 * Adds offensive emoji message data to blacklist sheet
 * @param {Discord.GuildMember} user
 * @param {WarnOffence} offence
 * @param {Discord.GuildMember} author
 */
async function addWarningSheet(user, offence, author) {
    const values = [
        new Date(offence.date).toLocaleString(),
        user.id,
        user.user.tag,
        user.nickname ? user.nickname : user.displayName,
        offence.reason,
        author.nickname ? author.nickname : author.displayName,
        author.id,
    ];
    await appendToSheet('Warning!A:G', [values]);
}

/**
 * Updates the data of user to sheet 'Database' and adds everyone in 'Old Database'
 * @param {any[][]} data
 */
async function updateDatabase(data) {
    await clearAndUpdateSheet('Database!A1:ZA', data);
}

/**
 * Checks whether user is a valid neoG participant
 * @param {string} email
 */
async function checkAuth(email) {
    const participants = (await getSheetValuesByName('Authorized!A2:A')).map((e) => e[0].toLowerCase());
    return participants.includes(email.toLowerCase());
}

module.exports = {
    addOffenceSheet,
    addWarningSheet,
    getSheetValuesByName,
    clearAndUpdateSheet,
    updateDatabase,
    appendToSheet,
    checkAuth,
};
