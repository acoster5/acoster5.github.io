/**
 * This code handles the Agent Assistant functionality in the client web app
 */
import assistService from './agent-assistant-service/script.js';

const platformClient = require('platformClient');
const conversationsApi = new platformClient.ConversationsApi();

// Messages of the client that are sent in a straight series.
let stackedText = ''; 

function showRecommendations(suggArr, conversationId, communicationId){    
    // Clears all the recommended mesages from the page
    clearRecommendations();

    // Display recommended replies in HTML
    for (var i = 0; i < suggArr.length; i++) {
        var suggest = document.createElement("a");
        suggest.innerHTML = suggArr[i];
        suggest.addEventListener('click', function(event) {
            sendMessage(this.innerText, conversationId, communicationId);
			//me
			//clearRecommendations();
        });

        var suggestContainer = document.createElement("div");
        suggestContainer.appendChild(suggest);
        suggestContainer.className = "suggest-container";
        document.getElementById("agent-assist").appendChild(suggestContainer);
    }    
}

function sendMessage(message, conversationId, communicationId){
	let opts = { 
		'useNormalizedMessage': false // Boolean | If true, response removes deprecated fields (textBody, media, stickers)
	};
	let body = {
            "textBody": message,
            "bodyType": "standard"
        }; 
    //conversationsApi.postConversationsMessageCommunicationMessages(conversationId, communicationId, body, opts);
	//console.log('****SendingMessage into chat');
	//alert('****SendingMessage into chat');
	conversationsApi.postConversationsMessageCommunicationMessages(conversationId, communicationId, body, opts)
		.then((data) => {
			//console.log(`postConversationsMessageCommunicationMessages success! data: ${JSON.stringify(data, null, 2)}`);
			console.log('****Message sent');
	})
	.catch((err) => {
		console.log('There was a failure calling postConversationsMessageCommunicationMessages');
		console.error(err);
	});
}

function clearRecommendations(){
	//document.getElementById("agent-assist").innerHTML = "";
    const suggContents = document.getElementById("agent-assist");
    while (suggContents.firstChild) {
        suggContents.removeChild(suggContents.firstChild);
    }
}

export default {
    getRecommendations(text, conversationId, communicationId){
		if(stackedText.includes(text)){
		}
		else{
			stackedText += text;
		}
		console.log(stackedText);
		// Unoptimized because it's reanalyzing a growing amount of text as long as
		// customer is uninterrupted. But good enough for the sample.
		let recommendations = assistService.analyzeText(stackedText);
		console.log(recommendations);
		showRecommendations(recommendations, conversationId, communicationId);
    },

    clearRecommendations(){
        clearRecommendations();
    },

    clearStackedText(){
        stackedText = '';
    }
}