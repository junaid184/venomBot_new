
const venom = require('venom-bot');
const express = require('express');
const app = express();
const {
    DistanceInMilesFinder,
    sendMessage,
    checksMessage,
} = require('./functions')
function handleQRCode(base64Qrimg, asciiQR, attempts, urlCode, res) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code</title>
      </head>
        <body>
            <img src="${base64Qrimg}">
        </body>
    </html>
`;
    // Set the content type to HTML
    res.setHeader('Content-Type', 'text/html');
    // Send the HTML res
    res.send(html)

}

app.get('/', async (req, res) => {
    venom
        .create({
            session: './tokens/faaiz', // Path to your session data
            catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
                // Call the custom handleQRCode function
                handleQRCode(base64Qrimg, asciiQR, attempts, urlCode, res);
            }
        })
        .then(async (client) => {
            checksMessage(client);
        });
})

app.listen(5000, () => {
    console.log(`http://localhost:5000`)

})