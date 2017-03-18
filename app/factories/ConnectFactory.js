"use strict";

app.factory('ConnectFactory', function() {

	let fbUserDb = firebase.database().ref('users');
	let fbMessagesDb = firebase.database().ref('messages');
    let fbGroupsDb = firebase.database().ref('groups');

	return {
		fbUserDb,
		fbMessagesDb,
		fbGroupsDb,
	};

});