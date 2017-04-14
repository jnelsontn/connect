'use strict';

app.factory('ConnectFactory', function($location, $route, $q) {

	// Firebase Database References
	let fbUserDb = firebase.database().ref('users');
	let fbMessagesDb = firebase.database().ref('messages');
	let fbImagesDb = firebase.database().ref('images');
	let fbGroupsDb = firebase.database().ref('groups');
	let fbPresenceDb = firebase.database().ref('presence');
	let fbNotificationDb = firebase.database().ref('notifications');
	let fbStatusUpdatesDb = firebase.database().ref('updates');
	let fbRelationshipsDb = firebase.database().ref('relationships');
	let date = new Date();

	// 'Connection' Request - compare userLoggedIn to userUID (profile visited)
	let didYouRequest = (database, userLoggedIn, userUID) => {
    	return $q(resolve => {
	    	database.child(userLoggedIn).child(userUID).once('value').then((x) => {
	        	if (userLoggedIn !== userUID) {
		            if (x.exists()) {
		                resolve(true);
		            } else {
		                resolve(false); 
		            }
	        	}
	    	});
	    });
    };

	let didTheyRequest = (database, userUID, userLoggedIn) => {
    	return $q(resolve => {
			database.child(userUID).child(userLoggedIn).once('value').then((x) => {
		    	if (userLoggedIn !== userUID) {
		            if (x.exists()) {
		                resolve(true);
		            } else {
		                resolve(false);
		            }
		        }
			});
		});
	};
	// End 'Connection' Request	

	// Send a Notice to the User's notification database
	let sendUidReq = (uidTo, uidFrom, msg) => {
		let obj = {
			timestamp: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
			uidTo: uidTo,
			uidFrom: uidFrom,
			content: msg,
		}; // Send to our Notifications database
		let x = fbNotificationDb.child(uidTo);
		x.push(obj);
    };

    // When a Request is Sent -- We wait for the Response
	let watchChange = (database, userUID, userLoggedIn, realName) => {
        database.child(userUID).child(userLoggedIn).on('value', (x) => {
            if (x.exists()) {
                let msg = realName + ' Confirmed Request';
                sendUidReq(userLoggedIn, userUID, msg);

                // If Requestor on Requestee Profile, Reload Page
                if ($location.url() === ('/profile/' + userUID)) { $route.reload(); }
            }
        });
    };

    // Used to Change a specific photo
	let changeSpecificPhoto = (imageId, userUID, fileName, userLoggedIn) => {
	    if (document.querySelector(imageId)) {
	        let newProfilePhotoId = document.querySelector(imageId);
	        let profileRef = firebase.storage().ref(userUID).child(fileName);

	        newProfilePhotoId.addEventListener('change', (e) => {
	            let file = e.target.files[0];

	            profileRef.put(file).then(() => {
	                // imagestorage: root-> uid -> profile.jpg
	                profileRef.getDownloadURL().then((url) => {
	                    fbUserDb.child(userLoggedIn).update(
	                    { photo: url });
					});
				});
			});
		}
	};

    // Used to Upload User Photos
	let imageUpload = (imageId, userUID, imageDb) => {
		if (document.querySelector(imageId)) {
			let imageUploadId = document.querySelector(imageId);
			if (imageUploadId) { // Must check so the imageId is NOT null.
				imageUploadId.addEventListener('change', (e) => {
					let file = e.target.files[0];
					let imageRef = firebase.storage().ref(userUID).child(file.name);

					imageRef.put(file).then(() => {
						imageRef.getDownloadURL().then((url) => {
							imageDb.push({ 
								photo: url, 
								fullpath: imageRef.fullPath, 
								filename: imageRef.name
							});
						});
					});
				}); 
			}
		}
	};

	return { fbUserDb, fbMessagesDb, fbImagesDb, fbGroupsDb, fbPresenceDb, fbStatusUpdatesDb, 
		fbRelationshipsDb, didYouRequest, didTheyRequest, sendUidReq, watchChange, 
		changeSpecificPhoto, imageUpload };

});