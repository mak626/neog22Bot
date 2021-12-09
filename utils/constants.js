/* eslint-disable max-len */
require('dotenv').config();
module.exports = {
    PREFIX: JSON.parse(process.env.CONFIG).prefix,
    SPREADSHEET_ID: process.env.SPREADSHEET_ID,
    TEST_SERVER_ID: '834479660468797451',
    CREDENTIALS: JSON.parse(process.env.CREDENTIALS),
    WEB_CREDENTIALS: JSON.parse(process.env.WEB_CREDENTIALS),
    TESTER_ID: process.env.TESTER_ID,

    EMAIL_REGEX:
        // eslint-disable-next-line no-useless-escape
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

    COLORS: {
        red: 0xff0000,
        green: 0x00ff00,
        yellow: 0xffff00,
        orange: 0xffa500,
        purple: 0x6a0dad,
        cyan: 0x00ffff,
    },
};
