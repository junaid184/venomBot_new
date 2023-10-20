const { Client } = require("@googlemaps/google-maps-services-js")
const userNumber = '923122975086'; //user number which we want to send the message

const DistanceInMilesFinder = async (a, b) => {
    const client = new Client();
    const response = await client.directions({
        params: {
            origin: a, // provider coordinates
            destination: b, // user coordinates
            key: "AIzaSyDMKqWExuhfyRYXtWOx1Ak1iXOIzNMDhWM",
        },
    });
    console.log("route", response?.data?.routes[0]?.legs[0]?.duration);
    console.log("dammam location check", response.data.routes[0].legs[0])
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
    client.onMessage(async (message) => {
        if (message.body === '1' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) { // if message from the usernumber  and also not from the group
            sendMessage(client, message.from, 'send your current location');
        }
        if (message.body === '2' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) {
            sendMessage(client, message.from, 'Battery Prices'); //here we will send the batter price lists and battery types
        }
        if (message.body === '3' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) {
            sendMessage(client, message.from, 'An agent will assist you soon')
        }
        if (message.type == 'location' && message.isGroupMsg === false && message.from === `${userNumber}@c.us`) { //if message type is location 
            console.log("Location coordinates: ", message.lat, message.lng);
            // calculate estimated time and check dammam
            const estimatedTime = await DistanceInMilesFinder(`24.9773, 66.9974`, `${message.lat},${message.lng}`); // replace first parameter with actual service center coordinates
            if (estimatedTime.end_address.includes('Dammam')) {
                sendMessage(client, message.from, `sorry we are not providing services in Dammam`);
            }
            else {
                console.log("distance: ", estimatedTime);
                sendMessage(client, message.from, `estimated time ${estimatedTime.duration.text}, thanks for choose our services a customer representative will reach to you`);
            }

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

module.exports = {
    DistanceInMilesFinder,
    sendMessage,
    checksMessage,
    start
}