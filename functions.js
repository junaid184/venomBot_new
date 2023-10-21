const { Client } = require("@googlemaps/google-maps-services-js");
const fs = require('fs');
const path = require('path');
const imageDirectory = './image/';
const imageExtensions = ['.jpg', '.png', '.jpeg'];
let userNumber = []
const providerNumber = '923452237310'; //provider number
const DistanceInMilesFinder = async (a, b) => {
    const client = new Client();
    const response = await client.directions({
        params: {
            origin: a, // provider coordinates
            destination: b, // user coordinates
            key: "AIzaSyDMKqWExuhfyRYXtWOx1Ak1iXOIzNMDhWM",
        },
    });
    const estimatedTime = response?.data?.routes[0]?.legs[0];
    return estimatedTime
}

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

function checksMessage(client) { //after sending first message (list of services message) it will wait for the client reply
    let providerLocation = {
        lat: null,
        lng: null
    }
    let lastUserWaiting = [];
    let queryArray = [];
    client.onMessage(async (message) => {
        console.log(message.from)
        if (message.body !== '1' && message.body !== '2' && message.body !== '3' && !userNumber.includes(message.from) && !message.from.includes(providerNumber))
            client.sendText(message.from,
                "List of services we are offering \n\n1. Battery Replacement \n\n2. Battery Prices \n\n3. Assistance \n\nSend the option 1 2 or 3")
                .then((result) => {
                    userNumber.push(message.from);
                    console.log('result', result?.status?.messageSendResult); //return object success

                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });
        if (message.body === '1' && message.isGroupMsg === false && userNumber.includes(message.from)) { // if message from the usernumber  and also not from the group
            sendMessage(client, message.from, 'send your current location');
        }
        if (message.body === '2' && message.isGroupMsg === false && userNumber.includes(message.from)) {
            fs.readdir(imageDirectory, (err, files) => {
                if (err) {
                    console.error('Error reading the directory:', err);
                    return;
                }

                // Filter files by extension
                files.filter(async (file) => {
                    imageExtensions.includes(path.extname(file).toLowerCase())
                    console.log("file", file);
                    await client
                        .sendImage( //here we will send the batter price lists and battery types
                            message.from,
                            `./image/${file}`,
                            'Battery Image',
                            'Price: 10000$'
                        )
                        .then((result) => {
                            console.log('Result: ', result); //return object success
                        })
                        .catch((erro) => {
                            console.error('Error when sending: ', erro); //return object error
                        });
                }

                );
            })

        }
        if (message.body === '3' && message.isGroupMsg === false && userNumber.includes(message.from)) {
            sendMessage(client, message.from, 'Tell me your query');
            queryArray.push(message.from);
        }
        if (userNumber.includes(message.from) && message.isGroupMsg == false && message.body !== '1' && message.body !== '2' && message.body !== '3') {
            for (const number of queryArray) {
                sendMessage(client, `${providerNumber}@c.us`,
                    `Customer number : ${message.from} \n\nQuery: ${message.body}`);
                sendMessage(client, number, 'An agent will assist you soon')
            }
            queryArray = []
        }
        if (message.type == 'location' && message.isGroupMsg === false) { //if message type is location 

            console.log("Location coordinates: ", message.lat, message.lng, 'location from: ', message.from);

            if (message.from === `${providerNumber}@c.us`) {
                providerLocation.lat = message.lat;
                providerLocation.lng = message.lng;
                for (const users of lastUserWaiting) {
                    const estimatedTime = await DistanceInMilesFinder(`
                    ${providerLocation.lat}, ${providerLocation.lng}`,
                        `${users.lat},${users.lng}`); // replace first parameter with actual service center coordinates
                    console.log("distance: ", estimatedTime);
                    sendMessage(client, `${users.from}`, // 1 hr
                        `estimated time ${estimatedTime.duration.text}, 
                        thanks for choose our services a customer representative will reach to you`);

                }
                lastUserWaiting = []
            }

            if (userNumber.includes(message.from)) {
                const area = await DistanceInMilesFinder('21.4817, 39.1828', `${message.lat},${message.lng}`) //first parameter is the jeddah coordinates just to check the user address is dammam or not
                if (area.end_address.includes('Dammam')) { //checks user location is dammam?
                    sendMessage(client, message.from,
                        `sorry we are not providing services in Dammam, you can select option no. 3 for the assistance`);
                }
                else {
                    sendMessage(client, message.from, //user
                        `Please wait for the response we are finding you a provider.`);

                    sendMessage(client, `${providerNumber}@c.us`, //ask provider for the location
                        'hey provider send me your current location');

                    lastUserWaiting.push(message);
                }
            }
        }
        // else if (userNumber.includes(message.from) && message.isGroupMsg === false) {
        //     sendMessage(client, message.from, `Sorry I can't understand you can select opt no. 3 for the assistance`);
        // }
    });
}


module.exports = {
    DistanceInMilesFinder,
    sendMessage,
    checksMessage,

}