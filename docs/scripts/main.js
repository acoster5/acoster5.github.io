import agentAssistant from './agent-assistant.js';
import controller from './notifications-controller.js';
import config from './config.js';

// Obtain a reference to the platformClient object
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

// API instances
const usersApi = new platformClient.UsersApi();
const conversationsApi = new platformClient.ConversationsApi();

let userId = '';
let agentID;
let currentConversation = null;
let currentConversationId = '';
let communicationId = '';

/**
 * Callback function for 'message' and 'typing-indicator' events.
 * For this sample, it will merely display the chat message into the page.
 * 
 * @param {Object} data the event data  
 */
/*
let onMessage = (data) => {
	alert('llega message');
    switch(data.metadata.type){
        case 'typing-indicator':
            break;
        case 'message':
            // Values from the event
            let eventBody = data.eventBody;
            let message = eventBody.body;
            let convId = eventBody.conversation.id;
            let senderId = eventBody.sender.id;
			//alert('message: '+message);
            // Conversation values for cross reference
            let conversation = currentConversation;
            let participant = conversation.participants.find(p => p.chats[0].id == senderId);
            let purpose = participant.purpose;

            // Get agent communication ID
            if(purpose == 'agent') {
                agentID = senderId;
                agentAssistant.clearStackedText();
            } else {
                let agent = conversation.participants.find(p => p.purpose == 'agent');
                agentID = agent.chats[0].id;
            }

            // Get some recommended replies
            if(purpose == 'customer') agentAssistant.getRecommendations(message, convId, agentID);

            break;
    }
};
*/
function onMessageBody (data){
	console.log('******* textBody onMessageBody: '+data.textBody);
	agentAssistant.getRecommendations(data.textBody, currentConversationId, communicationId);
}
function onMessageCommunicationId (data){
	let mparticipant = data.participants;
	let plenght= mparticipant.length;
	let i = 0;
	while (i < plenght) {
		let purpose = mparticipant[i].purpose;
		if(purpose == 'agent'){
			communicationId = mparticipant[i].messages[0].id;
		}
		i++;
	}
	console.log('******* onMessageCommunicationId: '+communicationId);
	return communicationId;
	//agentAssistant.getRecommendations(data.textBody, currentConversationId, currentConversationId);
}

let onMessage2 = (data) => {
	//console.log('******llega message: '+JSON.stringify(data, null, 2));
	let mparticipant = data.eventBody.participants[0];
	let mtype = mparticipant.type;
	//console.log('mtype: '+mtype);
    switch(mtype){
        case 'typing-indicator':
            break;
        case 'webmessaging':
			let mpurpose = mparticipant.purpose;
			//console.log('mpurpose: '+mpurpose);
			
            // Get agent communication ID
            if(mpurpose == 'agent') {
			//if(mpurpose != 'customer') {
                //agentID = senderId;
				
                agentAssistant.clearStackedText();
				agentAssistant.clearRecommendations();
            } else {
                //let agent = conversation.participants.find(p => p.purpose == 'agent');
                //agentID = agent.chats[0].id;
            }

            // Get some recommended replies
            if(mpurpose == 'customer') {
				let mlastmessage = mparticipant.messages.length;
				if(mlastmessage>0)
					mlastmessage = mlastmessage-1;
				
				let mmessageId = mparticipant.messages[mlastmessage].message.id;
				//console.log('mmessageId: '+mmessageId);
				//console.log('currentConversationId: '+currentConversationId);
				
				controller.getMessageText(currentConversationId, mmessageId,onMessageBody);
				//console.log('**** textBody onMessage2: '+textBody);
				//agentAssistant.getRecommendations(textBody, convId, agentID);
			}

            break;
    }
};

/**
 * Set-up the channel for chat conversations
 */
function setupChatChannel(){
    return controller.createChannel()
    .then(data => {
        // Subscribe to incoming chat conversations
        return controller.addSubscription(
            //`v2.users.${userId}.conversations.chats`,
			`v2.users.${userId}.conversations.messages`,
            //subscribeChatConversation(currentConversationId));
			onMessage2);
    });
}

/**
 * Subscribes the conversation to the notifications channel
 * @param {String} conversationId 
 * @returns {Promise}
 */
function getCommunicationId(conversationId){
	//console.log('calling subscribe ConversationID: '+conversationId);
    return controller.getCommunicationId(conversationId,onMessageCommunicationId);
}
/*
function subscribeChatConversation(conversationId){
	console.log('calling subscribe ConversationID: '+conversationId);
    return controller.addSubscription(
            //`v2.conversations.chats.${conversationId}.messages`,
			`v2.conversations.messages.${conversationId}`,
			//'v2.conversations.messages.6227f0a1-6847-404e-ade2-862302c2e096.messages.85c01f55d54c8bbf9259a39578a48308',
            onMessage);
}
*/
/*
function handleChat(conversationId){
	//alert('calling subscribe ConversationID: '+conversationId);
    return controller.addSubscription(
            //`v2.conversations.chats.${conversationId}.messages`,
			`v2.conversations.messages.${conversationId}`,
			//'v2.conversations.messages.6227f0a1-6847-404e-ade2-862302c2e096.messages.85c01f55d54c8bbf9259a39578a48308',
            onMessage);
			
}
*/

/** --------------------------------------------------------------
 *                       INITIAL SETUP
 * -------------------------------------------------------------- */
const urlParams = new URLSearchParams(window.location.search);
currentConversationId = urlParams.get('conversationid');

const redirectUri = (new URL (window.location.href)).hostname == 'localhost' ?
                config.testUri : config.prodUri;

client.setEnvironment(config.genesysCloud.region);
client.loginImplicitGrant(
    config.clientID,
    redirectUri,
    { state: currentConversationId })
.then(data => {
    console.log(data);

    // Assign conversation id
    currentConversationId = data.state;
    
    // Get Details of current User
    return usersApi.getUsersMe();
}).then(userMe => {
    userId = userMe.id;
    // Get current conversation
    return conversationsApi.getConversation(currentConversationId);
}).then((conv) => { 
    currentConversation = conv;
	
    return setupChatChannel();
}).then(() => { 
    return getCommunicationId(currentConversationId);
}).then(data => {
    console.log('Finished Setup');

// Error Handling
}).catch((e) => alert('Error'+e));
