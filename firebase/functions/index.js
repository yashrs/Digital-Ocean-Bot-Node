'use strict';

function saveFile(access_token)
{
    const fs = require('fs');
    fs.writeFileSync("token.txt", access_token);

}
var digitalocean = require('digitalocean');
var client = digitalocean.client('19c329e7db37014ad235be7b1f919f3a6f7aa27f8a0dab2945320551eec3c7b1');
client.account.get(function(err, account) {
    console.log(err); // null on success
    console.log(account); //
});

function snap_shot() {
    client.droplets.list().then(function(droplets) {
        var droplet = droplets[0];
        return client.droplets.snapshot(droplet.id);
    }).then(function() {
        console.log("created a snapshot of a Droplet!");
    }).catch(function(err) {
        // Deal with an error
    });
}

function create_droplet(n,x)
{
    client.droplets.create({name:x,region:"BLR1",size:"s-1vcpu-1gb",image:n},function (object) {
        console.log(object);
        return object;
    });
}

function create_droplet_ubuntu(nam)
{
    let image_name = "ubuntu-16-04-x64";
    create_droplet(image_name,nam);
}
function create_droplet_wordpress(nam)
{
    let image_name = "wordpress-16-04";
    create_droplet(image_name,nam);

}


/*function readFile()
{
    const fs = require('fs');
    const data = fs.readFileSync("token.txt");
}*/

const token = "19c329e7db37014ad235be7b1f919f3a6f7aa27f8a0dab2945320551eec3c7b1";

const client_secret = "34a1d0ef5277a1d682ea2d0813979e7fce42f1121800c558b414fb0bcba00d73"
const client_id = "15990d3b8a2f5d4909d79fa80a3101bfbcf8855eeda17a4b27d0717e7d62bdfe";

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    if (request.body.result)
    {
        processV1Request(request, response);
    }
    /*else if (request.body.queryResult)
    {
      processV2Request(request, response);
    }*/
    else
    {
        console.log('Invalid Request');
        return response.status(400).end('Invalid Webhook Request (expecting v1 or v2 webhook request)');
    }
});

function getInitialLink()
{
    return("https://cloud.digitalocean.com/v1/oauth/authorize?client_id=15990d3b8a2f5d4909d79fa80a3101bfbcf8855eeda17a4b27d0717e7d62bdfe&redirect_uri=https://us-central1-digital-ocean-5be6c.cloudfunctions.net/dialogflowFirebaseFulfillment&response_type=code&i=a16d14")
}

/*
* Function to handle v1 webhook requests from Dialogflow
*/
function processV1Request (request, response)
{

    let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
    let parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
    let inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts
    let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
    const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests
    const app = new DialogflowApp({request: request, response: response});
    // Create handlers for Dialogflow actions as well as a 'default' handler

    const actionHandlers =
        {
            // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
            'input.welcome': () =>
            {
                // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
                if (requestSource === googleAssistantRequest)
                {
                    app.ask(app.buildRichResponse()
                        .addSimpleResponse('Connect with us!')
                        .addBasicCard(app.buildBasicCard('Please connect')
                            .setTitle("Connect your account with us!")
                            .addButton("Click on this to get started!", getInitialLink())
                            .setSubtitle("Please come back to assistant after you have granted access")
                            .setImage('https://cdn.nucuta.com/2017/09/digitalocean_logo.jpg', 'Image alternate text')
                            .setImageDisplay('CROPPED'))
                    );
                    //sendGoogleResponse(aa)
                    //sendGoogleResponse('Hello, From Yash!'); // Send simple response to user
                }
                else
                {
                    sendResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
                }
            },
            'create_droplet' : () =>
            {
                app.askWithList('Okay, we will help you to do so. Let\'s get started! : ',
                    // Build a list
                    app.buildList('Select Droplet to deploy')
                    // Add the first item to the list
                        .addItems(app.buildOptionItem('WORDPRESSINSTALL',
                            ['wordpress', 'wordpress install', 'dropbox wordpress'])
                            .setTitle('WordPress')
                            .setDescription('WordPress is a FOSS CMS for blogging. -Yash')
                            .setImage('https://cdn.wordimpress.com/wp-content/uploads/wordpress.png', 'Wordpress'))
                        // Add the second item to the list
                        .addItems(app.buildOptionItem('UBUNTUINSTALL',
                            ['ubuntu', 'ubuntu install', 'ubuntu wordpress'])
                            .setTitle('Ubuntu')
                            .setDescription('Ubuntu is open-source Linux based OS. -Yash')
                            .setImage('https://assets.ubuntu.com/v1/1519d940-core_black-orange_st_hex.png', 'Ubuntu'))
                );

            },
            'wordpress.dep' : ()=>
            {
                create_droplet_wordpress('WordpressDroplet');
                app.ask("Wordpress Droplet Deployed");
            },
            'ubuntu.dep' : ()=>
            {
                create_droplet_ubuntu('UbuntuDroplet');
                app.ask("Ubuntu Droplet Deployed");
            },
            'take_snapshot' :()=>
            {

            }
            ,
            // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
            'input.unknown': () => {
                // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
                if (requestSource === googleAssistantRequest) {
                    sendGoogleResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
                } else {
                    sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
                }
            },
            // Default handler for unknown or undefined actions
            'default': () => {
                // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
                if (requestSource === googleAssistantRequest) {
                    let responseToUser = {
                        //googleRichResponse: googleRichResponse, // Optional, uncomment to enable
                        //googleOutputContexts: ['weather', 2, { ['city']: 'rome' }], // Optional, uncomment to enable
                        speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
                        text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
                    };
                    sendGoogleResponse(responseToUser);
                }
                else
                {
                    let responseToUser =
                        {
                            //data: richResponsesV1, // Optional, uncomment to enable
                            //outputContexts: [{'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}}], // Optional, uncomment to enable
                            speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
                            text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
                        };
                    sendResponse(responseToUser);
                }
            }
        };
    // If undefined or unknown action use the default handler
    if (!actionHandlers[action])
    {
        action = 'default';
    }
    // Run the proper handler function to handle the request from Dialogflow
    actionHandlers[action]();
    // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
    /*function sendGoogleResponse (responseToUser)
    {

      if (typeof responseToUser === 'string') {
        app.ask(responseToUser); // Google Assistant response
      }
      else
      {
        // If speech or displayText is defined use it to respond
        let googleResponse = app.buildRichResponse().addSimpleResponse({
          speech: responseToUser.speech || responseToUser.displayText,
          displayText: responseToUser.displayText || responseToUser.speech
        });
        // Optional: Overwrite previous response with rich response
        if (responseToUser.googleRichResponse) {
          googleResponse = responseToUser.googleRichResponse;
        }
        // Optional: add contexts (https://dialogflow.com/docs/contexts)
        if (responseToUser.googleOutputContexts) {
          app.setContext(...responseToUser.googleOutputContexts);
        }
        console.log('Response to Dialogflow (AoG): ' + JSON.stringify(googleResponse));
        app.ask(googleResponse); // Send response to Dialogflow and Google Assistant
      }
    }*/
    // Function to send correctly formatted responses to Dialogflow which are then sent to the user
    function sendResponse (responseToUser)
    {
        // if the response is a string send it as a response to the user
        if (typeof responseToUser === 'string')
        {
            let responseJson = {};
            responseJson.speech = responseToUser; // spoken response
            responseJson.displayText = responseToUser; // displayed response
            response.json(responseJson); // Send response to Dialogflow
        }
        else
        {
            // If the response to the user includes rich responses or contexts send them to Dialogflow
            let responseJson = {};
            // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;
            // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
            responseJson.data = responseToUser.data;
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            responseJson.contextOut = responseToUser.outputContexts;
            console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
            response.json(responseJson); // Send response to Dialogflow
        }
    }
}
// Construct rich response for Google Assistant (v1 requests only)
const app = new DialogflowApp();

// Rich responses for Slack and Facebook for v1 webhook requests
const richResponsesV1 = {
    'slack': {
        'text': 'This is a text response for Slack.',
        'attachments': [
            {
                'title': 'Title: this is a title',
                'title_link': 'https://assistant.google.com/',
                'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
                'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                'fallback': 'This is a fallback.'
            }
        ]
    },
    'facebook': {
        'attachment': {
            'type': 'template',
            'payload': {
                'template_type': 'generic',
                'elements': [
                    {
                        'title': 'Title: this is a title',
                        'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                        'subtitle': 'This is a subtitle',
                        'default_action': {
                            'type': 'web_url',
                            'url': 'https://assistant.google.com/'
                        },
                        'buttons': [
                            {
                                'type': 'web_url',
                                'url': 'https://assistant.google.com/',
                                'title': 'This is a button'
                            }
                        ]
                    }
                ]
            }
        }
    }
};