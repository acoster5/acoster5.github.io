/**
 * This file manages the channel that listens to chat events.
 */
const platformClient = require('platformClient');
const notificationsApi = new platformClient.NotificationsApi();
//me
const conversationsApi = new platformClient.ConversationsApi();

let channel = {};
let ws = null;

// Object that will contain the subscription topic as key and the
// callback function as the value
let subscriptionMap = {
    'channel.metadata': () => {
        console.log('Notification heartbeat.');
    }
};

/**
 * Callback function for notications event-handling.
 * It will reference the subscriptionMap to determine what function to run
 * @param {Object} event 
 */
function onSocketMessage(event){
    let data = JSON.parse(event.data);

    subscriptionMap[data.topicName](data);
}

export default {
    /**
     * Creation of the channel. If called multiple times,
     * the last one will be the active one.
     */
    createChannel(){
        return notificationsApi.postNotificationsChannels()
        .then(data => {
            console.log(data);

            channel = data;
            ws = new WebSocket(channel.connectUri);
            ws.onmessage = onSocketMessage;
			//alert('---- Created2 Notifications Channel ----');
        });
    },

    /**
     * Add a subscription to the channel
     * @param {String} topic PureCloud notification topic string
     * @param {Function} callback callback function to fire when the event occurs
     */
    addSubscription(topic, callback){
        let body = [{'id': topic}]
		//console.log('Addeding subscription to topic: '+ topic);
        return notificationsApi.postNotificationsChannelSubscriptions(
                channel.id, body)
        .then((data) => {
            subscriptionMap[topic] = callback;
            console.log(`Added subscription to ${topic}`);
        });
    },
	
	//me
	getCommunicationId(conversationId,callback){	
		return conversationsApi.getConversation(conversationId)
			.then((data) => {
			//console.log(`getCommunicationId success! data: ${JSON.stringify(data, null, 2)}`);
			callback(data);
		})
		.catch((err) => {
			console.log('There was a failure calling getCommunicationId');
		console.error(err);
		});
    },
	getMessageText(conversationId, messageId, callback){	
		let opts = { 
			'useNormalizedMessage': false // Boolean | If true, response removes deprecated fields (textBody, media, stickers)
		};
		return conversationsApi.getConversationsMessageMessage(conversationId, messageId, opts)
			.then((data) => {
			//console.log(`getConversationsMessageMessage success! data: ${JSON.stringify(data, null, 2)}`);
			callback(data);

		})
		.catch((err) => {
			console.log('There was a failure calling getConversationsMessageMessage');
		console.error(err);
		});
    }
}