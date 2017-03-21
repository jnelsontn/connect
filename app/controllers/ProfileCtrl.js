'use strict';

app.controller('ProfileCtrl', function($scope, $location, $window, $q, $route, $firebaseObject, $firebaseArray, 
    $routeParams, AuthFactory, ConnectFactory) {

    let date = new Date();
    let userLoggedIn = AuthFactory.getUser();
    let userUID = $routeParams.profileId;
    let profileRef = firebase.storage().ref(userUID).child('profile.jpg');

    $scope.visitorRealName = $firebaseObject(ConnectFactory.fbUserDb.child(userLoggedIn));
    $scope.connectReqText = 'Request Connection';
    $scope.respondReqText = 'Respond to Request';
    $scope.isOnline = false;
    $scope.myOwnProfile = false;
    $scope.AreWeConnected = false;
    $scope.button_clicked = false;
    $scope.respondReq = false;

    // If the Profile Matches the Logged In User, myOwnProfile = True (for Viewing Options on Pg)
    if (userLoggedIn === userUID) { $scope.myOwnProfile = true; }

    $firebaseObject(ConnectFactory.fbUserDb.child(userUID)).$loaded().then((x) => { $scope.profile = x; });
    $firebaseArray(ConnectFactory.fbMessagesDb.child(userUID)).$loaded().then((x) => { $scope.messages = x; });
    $firebaseArray(ConnectFactory.fbStatusUpdatesDb.child(userUID)).$loaded().then((x) => { $scope.updates = x; });

    ConnectFactory.fbPresenceDb.child(userUID).once('value', (x) => {
        if (x.exists()) {
            $scope.isOnline = true;
            // console.log(userUID + ' is online');
        }
     });

    let didYouRequest = ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID)
    .once('value').then((x) => {
        if (userLoggedIn !== userUID) {
            if (x.exists()) {
                console.log('Did You Send Request? : Yes');
                return true;
            } else {
                console.log('Did You Send Request? : No');
                return false; 
            }
        }
    });

    let didTheyRequest = ConnectFactory.fbGroupsDb.child(userUID).child(userLoggedIn)
    .once('value').then((x) => {
       if (userLoggedIn !== userUID) {
            if (x.exists()) {
                console.log('Have they requested You? : Yes');
                return true;
            } else {
                console.log('Have they requested You? : No');
                return false;
            }
        }
    });

    $q.all([didYouRequest, didTheyRequest]).then(([you, they]) => {
        if ((you === true) && (they === true)) {
            $scope.AreWeConnected = true;
            console.log('We are Connected: ', $scope.AreWeConnected);
        } else if ((you === true) && (they === false)) {
            console.log('You sent a request. They have not responded.');
            $scope.connectReqText = 'Request Pending';
            $scope.button_clicked = true;
        } else if ((you === false) && (they === true)) {
            $scope.respondReq = true;
            console.log('They sent you a request. You have not responded.');
        } else if ((you === undefined) && (they === undefined)) {
            $scope.myOwnProfile = true;
        } else {
            console.log('We are not Connected.');
        }
    });

    $scope.connect = () => {
        if (userLoggedIn !== userUID) {
            // How Connections are Made:
            // When the Requestor sends a 'Connection Request', an object is created in 
            // root->groups->requestor->requestee key. If the requestee responds, an
            // object is created under their uid. root->groups->requestee->requestor key.
            // If both parties have each other's keys, the connection is confirmed.
            ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set({ connected: true });

            // Reciever, Sender, Message
            let msg = $scope.visitorRealName.name + ' Sent You A Connection Request';
            ConnectFactory.sendUidReq(userUID, userLoggedIn, msg);

            watchChange();
            $scope.connectReqText = 'Request Pending';
            $scope.button_clicked = true;
        }
    };

    // Respond to a Connection Request & Reload the Page 
    $scope.respondToRequest = () => {
        ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set({ connected: true });
        $route.reload();
    };

    $scope.addMessage = () => {
        // Do we need an Auth Check?
        $scope.messages.$add({
            timestamp: date.toLocaleString(),
            from: $scope.visitorRealName.name,
            uidfrom: userLoggedIn,
            uidto: userUID,
            content: $scope.message
        });
        // Need Functionality to Delete Posted Messages
        $scope.myOwnMessage = true;
        // Send a Notification to the Reciever of the Message
        if (userLoggedIn !== userUID) {
            let x = $scope.visitorRealName.name + ' Wrote on your Profile.';
            ConnectFactory.sendUidReq(userUID, userLoggedIn, x);
        }
        $scope.message = '';
    };

    $scope.userUpdateStatus = () => {
        if (userLoggedIn === userUID) {
            $scope.updates.$add({
                timestamp: date.toLocaleString(),
                from: $scope.profile.name,
                content: $scope.update
            });
            $scope.update = '';
        }
        // Will Add Global Notification Here
    };

    $scope.saveProfile = () => {
        if (userLoggedIn === userUID) {
            $scope.profile.$save().then(() => {
                console.log('Profile Saved!');
                $window.location.href = '#!/profile/' + userUID;
            }).catch((error) => {
                console.log('Error Editing Profile');
            });
        } else {
            $window.location.href = '#!/profile/' + userLoggedIn;
        }
    };


    // When a Connection Request is sent, this function waits for the reply
    // and, if positive, send a notification back to the requestor.
    function watchChange() {
        // console.log('Waiting for Other User to Accept Connection Request');
        ConnectFactory.fbGroupsDb.child(userUID).child(userLoggedIn).on('value', (x) => {
            if (x.exists()) {
                // console.log($scope.profile.name + ' Confirmed Request');
                let msg = $scope.profile.name + ' Confirmed Request';
                ConnectFactory.sendUidReq(userLoggedIn, userUID, msg);

                // If Requestor on Requestee Profile, Reload Page
                if ($location.url() === ('/profile/' + userUID)) { $route.reload(); }
            }
        });
    }

    let newProfilePhotoId = document.querySelector('#the-file-input');
    if (newProfilePhotoId) {
        newProfilePhotoId.addEventListener('change', (e) => {
            let file = e.target.files[0];
            console.log('File Properties: ', file);

            profileRef.put(file).then(() => {
                console.log('Successfully Uploaded File!');

                profileRef.getDownloadURL().then((url) => {
                    ConnectFactory.fbUserDb.child(userLoggedIn).update(
                    { photo: url });
                });
            });
        });
    }

});

