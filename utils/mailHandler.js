require('dotenv').config();
const nodemailer = require('nodemailer');
const { htmlParser } = require('./html_parser');
const { logger } = require('./logger');

const options = {
    host: 'smtp.sendgrid.net',
    port: 465,
    pool: true,
    secure: true,
    rateDelta: 60000,
    rateLimit: 500,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID,
    },
};

const transporter = nodemailer.createTransport(options);

async function sendMail(email, verificationCode, attachments, subject, date, replaceString, htmlPath) {
    logger.info(`Sending mail to ${email}`);
    const html = htmlParser(htmlPath).replace(replaceString || '<#verificationCode>', date || verificationCode);

    return new Promise(
        (resolve) =>
            // eslint-disable-next-line implicit-arrow-linebreak
            transporter.sendMail(
                {
                    from: `"${process.env.USER_NAME} NO-REPLY" <${process.env.GOOGLE_USER}>`,
                    to: email,
                    subject: subject || 'Verification For #neogCamp 2022 Discord Server',
                    html,
                    attachments: [
                        {
                            path: './assets/mail/neog.png',
                            cid: 'neog',
                        },
                        ...attachments
                    ],
                },
                (e) => {
                    if (e) {
                        logger.error(`IMPORTANT: Error Occured While Sending ERROR Mail: ${e.message} | ${e?.stack}`);
                        resolve(false);
                    } else {
                        logger.info(`Mail has been sent to ${email}`);
                        resolve(true);
                    }
                }
            )
        // eslint-disable-next-line function-paren-newline
    );
}

module.exports = { sendMail };
