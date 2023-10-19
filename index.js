
const venom = require('venom-bot');
const express = require('express');
const app = express();
const userNumber = '923232055861'; //user number which we want to send the message

function sendMessage(client, number, message) { //function to send the message
    client
        .sendText(number, message)
        .then((result) => {
            console.log('result', result?.status?.messageSendResult); //return object success

        })
        .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
        });
}

function checkDammamLocation(lat, long) { //checks the dammam coordination
    // Define the latitude and longitude of Dammam, Saudi Arabia
    const dammamLatitude = 26.392666;
    const dammamLongitude = 50.112158;

    // Define a range of 0 (exact match) around Dammam's coordinates
    const latitudeRange = 0; // Exact match for latitude
    const longitudeRange = 0; // Exact match for longitude

    // Function to check if a location is within the specified range around Dammam
    function isLocationInRange(latitude, longitude) {
        const withinLatitudeRange = Math.abs(latitude - dammamLatitude) <= latitudeRange;
        const withinLongitudeRange = Math.abs(longitude - dammamLongitude) <= longitudeRange;
        return withinLatitudeRange && withinLongitudeRange;
    }

    // Example user's location coordinates
    const userLatitude = lat; // Replace with the actual latitude of the user's location
    const userLongitude = long; // Replace with the actual longitude of the user's location

    // Check if the user's location is an exact match with Dammam's coordinates
    if (isLocationInRange(userLatitude, userLongitude)) {
        return 0
    } else {
        return 1
    }

}
function checksMessage(client) { //after sending first message (list of services message) it will wait for the client reply
    client.onMessage(async (message) => {
        if (message.body === 'Battery Replacement' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) { // if message from the usernumber  and also not from the group
            sendMessage(client, message.from, 'send your current location');
        }
        if (message.body === 'Battery Prices' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) {
            sendMessage(client, message.from, 'Battery Prices'); //here we will send the batter price lists and battery types
        }
        if (message.body === 'Assistant' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) {
            sendMessage(client, message.from, 'An agent will assist you soon')
        }
        if (message.type == 'location' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) { //if message type is location 
            console.log("Location coordinates: ", message.lat, message.lng);
            const result = checkDammamLocation(message.lat, message.lng);
            console.log("Check Dammam Result: ", result, "(0 means user in dammam and 1 means user outside the dammam)");
        }
        // else {
        //     console.log(message.notifyName, message.body);
        // }

    });
}
function start(client) { //sending the first message 
    client.sendText(`${userNumber}@c.us`,
        "List of services we are offering \n\n1. Battery Replacement \n\n2. Battery Prices \n\n3. Assistance \n\nSend the option 1 2 or 3")
        .then((result) => {
            console.log('result', result?.status?.messageSendResult); //return object success
        })
        .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
        });
    checksMessage(client);

}

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

app.get('/qr', (req, res) => {
    venom
        .create({
            session: './tokens/faaiz', // Path to your session data
            catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
                // Call the custom handleQRCode function
                handleQRCode(base64Qrimg, asciiQR, attempts, urlCode, res);
            }

        })
        .then((client) => start(client))
        .catch((erro) => {
            console.log(erro.message);
        });

});

app.listen(5000, () => {
    console.log(`http://localhost:5000`)

})
