'use strict';

app.controller('ProfileCtrl', function($scope, $location, $window, $q, $route, $firebaseObject, $firebaseArray, 
    $routeParams, AuthFactory, ConnectFactory) {

    let userLoggedIn = AuthFactory.getUser();
    let userUID = $routeParams.profileId;

    // Load Databases using AngularFire -- do we need $loaded?
    $scope.profile = $firebaseObject(ConnectFactory.fbUserDb.child(userUID));
    $scope.visitorProfile = $firebaseObject(ConnectFactory.fbUserDb.child(userLoggedIn));
    $scope.messages = $firebaseArray(ConnectFactory.fbMessagesDb.child(userUID));
    $scope.updates = $firebaseArray(ConnectFactory.fbStatusUpdatesDb.child(userUID));
    $scope.relationshipData = $firebaseObject(ConnectFactory.fbRelationshipsDb.child(userUID));

    $scope.myOwnProfile = false;
    $scope.isOnline = false;

    // Connection Request
    $scope.AreWeConnected = false;
    $scope.connect_button_clicked = false;
    $scope.respondConnReq = false;
    $scope.connectReqText = 'Request Connection';
    $scope.respondConnReqText = 'Respond to Request';

    // Relationship Request
    $scope.InRelationship = false;
    $scope.respondRelReq = false;
    $scope.relationship_button_clicked = false;
    $scope.relationshipReqText = 'Relationship Request';
    $scope.respondRelReqText = 'Confirm Relationship';

    let date = new Date();

    // I don't think $loaded is needed - we should resolve in routeparams?
   /* $firebaseObject(ConnectFactory.fbUserDb.child(userUID)).$loaded().then((x) => {
        console.log(x); 
        $scope.profile = x;
    });
    */

    // If the Profile Matches the Logged In User, myOwnProfile = True (for Viewing Options on Pg)
    if (userLoggedIn === userUID) { 
        $scope.myOwnProfile = true; 
        // Event Listener to Change Profile Photo
        let ChangeProfilePhoto = 
        ConnectFactory.changeSpecificPhoto('#the-file-input', userUID, 'profile.jpg', userLoggedIn);
    }

    let checkOnlinePresense = ConnectFactory.fbPresenceDb.child(userUID).once('value', (x) => {
        if (x.exists()) { $scope.isOnline = true; }
     });

    // Connection & Relationships
    let yourConnReq = ConnectFactory.didYouRequest(ConnectFactory.fbGroupsDb, userLoggedIn, userUID);
    let theirConnReq = ConnectFactory.didTheyRequest(ConnectFactory.fbGroupsDb, userUID, userLoggedIn);
    let completeRequest =
    $q.all([yourConnReq, theirConnReq]).then(([you, they]) => {
        if (userLoggedIn !== userUID) {
            if (you && they) {
                $scope.AreWeConnected = true;
                console.log('We are Connected: ', $scope.AreWeConnected);
                let yourRelReq = ConnectFactory.didYouRequest(ConnectFactory.fbRelationshipsDb, userLoggedIn, userUID);
                let theirRelReq = ConnectFactory.didTheyRequest(ConnectFactory.fbRelationshipsDb, userUID, userLoggedIn);
                $q.all([yourRelReq, theirRelReq]).then(([yourRel, theyRel]) => {
                    // Relationship
                    if (yourRel && theyRel) {
                        $scope.InRelationship = true;
                        console.log('You are in a relationship: ', $scope.InRelationship);
                    } else if (yourRel && !theyRel) {
                        $scope.relationshipReqText = 'Relationship Pending';
                        $scope.relationship_button_clicked = true;
                        console.log('You sent a relationship request. They have not responded.');
                    } else if (!yourRel && theyRel) {
                        $scope.respondRelReq = true;
                        console.log('They sent you a relationship request. You have not responded.');
                    } else {
                        console.log('You are not in a relationship with this person.');
                    }
                });
            // Not Connected & No Relationship continue
            } else if (you && !they) {
                $scope.connectReqText = 'Connection Request Pending';
                $scope.connect_button_clicked = true;
                console.log('You sent a Connection request. They have not responded.');
            } else if (!you && they) {
                $scope.respondConnReq = true;
                console.log('They sent you a Connection request. You have not responded.');
            } else if ((you === undefined) && (they === undefined)) {
                $scope.myOwnProfile = true;
                console.log('Your are on your own Profile');
            } else {
                console.log('We are not Connected.');
            }
        }
    });

    // Connection Request, Response & Remove Connection
    $scope.connectRequest = () => {
        if (userLoggedIn !== userUID) {
            $scope.connect_button_clicked = true;
            // How Connections are Made:
            // When the Requestor sends a 'Connection Request', an object is created in 
            // root->groups->requestor->requestee key. If the requestee responds, an
            // object is created under their uid. root->groups->requestee->requestor key.
            // If both parties have each other's keys, the connection is confirmed.
            ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set({ connected: true });

            // Reciever, Sender, Message
            let msg = $scope.visitorProfile.name + ' Sent You A Connection Request';
            ConnectFactory.sendUidReq(userUID, userLoggedIn, msg);
            ConnectFactory.watchChange(ConnectFactory.fbGroupsDb,userUID, userLoggedIn, $scope.profile.name);
        }
    };

    $scope.respondToConnectionRequest = () => {
        ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set({ connected: true });
        $route.reload();
    };

    $scope.removeConnection = () => {
        // Remove both User's keys under root->groups->uid->other-user
        ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).remove();
        ConnectFactory.fbGroupsDb.child(userUID).child(userLoggedIn).remove();
        $route.reload();
    };
    // End Connection ----------------------->

    // Relationship Request, Response & Remove
    $scope.relationshipRequest = () => {
        if (userLoggedIn !== userUID) {
            $scope.relationship_button_clicked = true;
            ConnectFactory.fbRelationshipsDb.child(userLoggedIn).child(userUID).set({ 
                relationship: true,
                partneruid: $scope.profile.uid,
                partner: $scope.profile.name
            });

            // Reciever, Sender, Message
            let msg = $scope.visitorProfile.name + ' Sent You A Relationship Request';
            ConnectFactory.sendUidReq(userUID, userLoggedIn, msg);
            ConnectFactory.watchChange(ConnectFactory.fbRelationshipsDb, userUID, userLoggedIn, $scope.profile.name);
        }
    };

    $scope.respondToRelationshipRequest = () => {
        ConnectFactory.fbRelationshipsDb.child(userLoggedIn).child(userUID).set({ 
            relationship: true,
            partneruid: $scope.profile.uid,
            partner: $scope.profile.name
        });
        $route.reload();
    };

    $scope.removeRelationship = () => {
        // Remove both User's keys under root->groups->uid->other-user
        ConnectFactory.fbRelationshipsDb.child(userLoggedIn).child(userUID).remove();
        ConnectFactory.fbRelationshipsDb.child(userUID).child(userLoggedIn).remove();
        $route.reload();
    };
    // End Relationship ----------------------->

    $scope.addMessage = () => {
        $scope.messages.$add({
            uidfrom: userLoggedIn,
            uidto: userUID,
            timestamp: date.toLocaleString(),
            from: $scope.visitorProfile.name,
            content: $scope.message
        });
        $scope.message = '';
        // Send a Notification to the Reciever of the Message
        if (userLoggedIn !== userUID) {
            let x = $scope.visitorProfile.name + ' Wrote on your Profile.';
            ConnectFactory.sendUidReq(userUID, userLoggedIn, x);
        }
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
    };

    $scope.saveProfile = () => {
        if (userLoggedIn === userUID) {
            $scope.profile.$save().then(() => {
                console.log('Profile Saved!');
                $window.location.href = '#!/profile/' + userUID;
            });
        } else {
            $window.location.href = '#!/profile/' + userLoggedIn;
        }
    };
    
});

