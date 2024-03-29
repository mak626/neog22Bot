const fs = require('fs');
const juice = require('juice');

const htmlParser = (path) => {
    const attachment = [
        {
            path: './assets/mail/neog.png',
            cid: 'neog',
        },
    ];
    const htmlFilePath = path || './assets/mail/content.html';
    const html = fs.readFileSync(htmlFilePath, 'utf-8', () => { });
    let css = fs.readFileSync(htmlFilePath.replace('html', 'css'), 'utf-8', () => { });

    // Converting css variables to inline
    const reg = /--.*:.*;/gm;
    const varArray = css.matchAll(reg);

    // eslint-disable-next-line no-restricted-syntax
    for (const variable of varArray) {
        const [name, value] = variable[0].trim().replace(';', '').split(':');
        const regex = `var(${name.trim()})`;
        css = css.split(regex).join(value.trim());
    }

    // Inserting css data into html tags
    let parsedHtml = juice.inlineContent(html, css);

    // Renaming paths to cid format
    attachment.forEach((e) => {
        parsedHtml = parsedHtml.replace(`${e.cid}.png`, `cid:${e.cid}`);
    });
    return parsedHtml;
};

module.exports = { htmlParser };
