'use strict';

app.factory('ConnectFactory', function() {

	// Firebase Database References
	let fbUserDb = firebase.database().ref('users');
	let fbMessagesDb = firebase.database().ref('messages');
	let fbImagesDb = firebase.database().ref('images');
    let fbGroupsDb = firebase.database().ref('groups');
    let fbPresenceDb = firebase.database().ref('presence');
    let fbNotificationDb = firebase.database().ref('notifications');
    let fbStatusUpdatesDb = firebase.database().ref('updates');

    let date = new Date();
    let sendUidReq = (uidTo, uidFrom, msg) => {
		let obj = {
			timestamp: (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(),
			uidTo: uidTo,
			uidFrom: uidFrom,
			content: msg,
		};
		let x = fbNotificationDb.child(uidTo);
    	x.push(obj);
    };

	return {
		fbUserDb,
		fbMessagesDb,
		fbImagesDb,
		fbGroupsDb,
		fbPresenceDb,
		fbStatusUpdatesDb,
		sendUidReq
	};

});