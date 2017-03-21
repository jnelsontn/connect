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
	let date = new Date();

    let didYouRequest = (userLoggedIn, userUID) => {
    	return $q(resolve => {
	    	fbGroupsDb.child(userLoggedIn).child(userUID).once('value').then((x) => {
	        	if (userLoggedIn !== userUID) {
		            if (x.exists()) {
		                console.log('Did You Send Request? : Yes');
		                resolve(true);
		            } else {
		                console.log('Did You Send Request? : No');
		                resolve(false); 
		            }
	        	}
	    	});
	    });
    };

    let didTheyRequest = (userUID, userLoggedIn) => {
    	return $q(resolve => {
			fbGroupsDb.child(userUID).child(userLoggedIn).once('value').then((x) => {
		    	if (userLoggedIn !== userUID) {
		            if (x.exists()) {
		                console.log('Have they requested You? : Yes');
		                resolve(true);
		            } else {
		                console.log('Have they requested You? : No');
		                resolve(false);
		            }
		        }
	    	});
		});
	};

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

    let watchChange = (userUID, userLoggedIn, realName) => {
        fbGroupsDb.child(userUID).child(userLoggedIn).on('value', (x) => {
            if (x.exists()) {
                // console.log($scope.profile.name + ' Confirmed Request');
                let msg = realName + ' Confirmed Request';
                sendUidReq(userLoggedIn, userUID, msg);

                // If Requestor on Requestee Profile, Reload Page
                if ($location.url() === ('/profile/' + userUID)) { $route.reload(); }
            }
        });
    };

    let changeSpecificPhoto = (imageId, userUID, fileName, userLoggedIn) => {
	    if (document.querySelector(imageId)) {
	        let newProfilePhotoId = document.querySelector(imageId);
	        let profileRef = firebase.storage().ref(userUID).child(fileName);

	        newProfilePhotoId.addEventListener('change', (e) => {
	            let file = e.target.files[0];
	            console.log('File Properties: ', file);

	            profileRef.put(file).then(() => {
	                console.log('Successfully Uploaded File!');

	                profileRef.getDownloadURL().then((url) => {
	                    fbUserDb.child(userLoggedIn).update(
	                    { photo: url });
	                });
	            });
	        });
	    }
    };

	let imageUpload = (imageId, userUID, imageDb) => {
		if (document.querySelector(imageId)) {
			let imageUploadId = document.querySelector(imageId);
			if (imageUploadId) {
				imageUploadId.addEventListener('change', (e) => {
					let file = e.target.files[0];
					let imageRef = firebase.storage().ref(userUID).child(file.name);
					console.log('File Properties: ', file);

					imageRef.put(file).then(() => {
						console.log('Successfully Uploaded File!');
						imageRef.getDownloadURL().then((url) => {
							imageDb.push({ photo: url });
						});
					});
				}); 
			}
		}
	};

	return { fbUserDb, fbMessagesDb, fbImagesDb, fbGroupsDb, fbPresenceDb, fbStatusUpdatesDb,
		sendUidReq, watchChange, didYouRequest, didTheyRequest, changeSpecificPhoto, imageUpload };

});