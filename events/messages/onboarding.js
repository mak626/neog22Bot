const { PREFIX } = require('../../utils/constants');

const WELCOME_MESSAGE = [
    'Hello @USERNAME :wave:',
    "I'm neoG22 Bot and I'm here to welcome you to the neoG Camp 2022 (exclusive) server on Discord!",
    '\nBefore you can join in the fun, I need to ask you a few questions.',
    'If you have any trouble, Mail to neogcamp@gmail.com',
    "In less than 5 minutes, you'll have full access to this server.",
    "So, let's get started! :nerd: ",
    "Here's the first question:",
    "\n**🔺1. What's your name?**",
    'TIP: 🤝Real names help you build better connections',
].join('\n');

const QUESTION_TWO = [
    '✅ Great, Hi **@ANSWER_NAME** :wave:',
    "\nI've changed your name on this server to **@ANSWER_NAME**.",
    `If you'd like to change it back then type: \`${PREFIX}name <NAME>\`, Eg: \`${PREFIX}name Tanay Pratap\``,
    "\n**🔺2. What's your email address?**",
].join('\n');

const QUESTION_THREE = [
    '✅ Awesome, we have sent a verification email to: **@EMAIL** .',
    `\nIf you haven't recieved the code type: \`${PREFIX}email <YOUR_EMAIL>\` again to resent the code, Eg: \`${PREFIX}email teamtanaydiscord@gmail.com\``,
    '\n**🔺3. Enter the verification code sent to your mail**',
].join('\n');

const ERROR_MAIL = [
    'Please try again later using command',
    `\`${PREFIX}email <YOUR_EMAIL>\``,
    `Eg: \`${PREFIX}email teamtanaydiscord@gmail.com\``,
];

const QUESTION_FOUR = [
    '✅ Great, we are almost done, are you on GitHub?',
    '\nWe would need your GitHub ID',
    'For example if this is your GitHub link: <https://github.com/tanaypratap>',
    'Your username is: `tanaypratap`',
    '\n**🔺4. Enter your GitHub username**',
].join('\n');

const QUESTION_FIVE = [
    '✅ Great GitHub profile: **@GITHUB**',
    `If you'd like to change it back then type: \`${PREFIX}gh <GITHUB_USERNAME>\`, Eg: \`${PREFIX}gh tanaypratap\``,
    "\nOur community is commited to certain standards of behavior and we enforce that behavior to ensure it's a nice place to spend time.",
    'Further, we follow few terms and policies too.',
    'Please read about our code of conduct, terms and policies here: <https://bit.ly/neogcamp2022-rulebook>',
    '\n**🔺5. Do you agree to abide by and uphold the code of conduct, terms and policies ?**',
    'Reply: `yes`',
].join('\n');

const FINAL = [
    '**✅ Congrats, your onboarding for neoG Camp 2022 is complete.',
    '\n✨Welcome to neoG Camp 2022.✨**',
    'Here is your personal kit',
    '<https://bit.ly/neoGCamp22Kit>',
    'Do read it to understand the structure of the camp.',
    'Happy learning :)',
    '\nHead over to https://discord.com/channels/914867137863118919/914867138148335657 and say **hello** to your new coding family.',
].join('\n');

const MESSAGES = { WELCOME_MESSAGE, QUESTION_TWO, QUESTION_THREE, QUESTION_FOUR, QUESTION_FIVE, FINAL, ERROR_MAIL };

module.exports = { MESSAGES };

// @USERNAME
// @DISCORD_USERNAME
// @EMAIL
// @ANSWER_NAME
