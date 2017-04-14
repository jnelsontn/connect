'use strict';

app.controller('ProfileCtrl', function($scope, $window, $q, $timeout, $route, $firebaseObject, $firebaseArray, 
    $routeParams, AuthFactory, ConnectFactory) {

    let userLoggedIn = AuthFactory.getUser();
    let userUID = $routeParams.profileId;

    // Load Databases using AngularFire
    $scope.profile = $firebaseObject(ConnectFactory.fbUserDb.child(userUID));
    $scope.visitorProfile = $firebaseObject(ConnectFactory.fbUserDb.child(userLoggedIn));
    $scope.messages = $firebaseArray(ConnectFactory.fbMessagesDb.child(userUID));
    $scope.updates = $firebaseArray(ConnectFactory.fbStatusUpdatesDb.child(userUID));
    $scope.relationshipData = $firebaseArray(ConnectFactory.fbRelationshipsDb.child(userUID));

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
    $scope.hideRelationshipButton = false;
    $scope.thisUserInRelationship = false;
    $scope.loggedInUserInRelationship = false;
    $scope.relationshipReqText = 'Request Relationship';
    $scope.respondRelReqText = 'Confirm Relationship';

    let date = new Date();

    // If the Profile Matches the Logged In User, myOwnProfile = True (for Viewing Options on Pg)
    if (userLoggedIn === userUID) { 
        $scope.myOwnProfile = true; 
        let ChangeProfilePhoto = 
        ConnectFactory.changeSpecificPhoto('#the-file-input', userUID, 'profile.jpg', userLoggedIn);
    }

    // Check if logged-in user is in existing relationship (or sent a request)
    ConnectFactory.fbRelationshipsDb.child(userLoggedIn).once('value').then((x) => {
        if (x.exists()) { $scope.loggedInUserInRelationship = true; }
    });

    // Check if the user's profile being visited is in a relationship
    ConnectFactory.fbRelationshipsDb.child(userUID).once('value').then((x) => {
        if (x.exists()) { 
            $scope.hideRelationshipButton = true; 

            var partnerRel;
            x.forEach((y) => {
                let value = y.val();
                partnerRel = value.partneruid;
            }); 

            // Check if the user's profile has a confirmation of relationship
            ConnectFactory.fbRelationshipsDb.child(partnerRel).once('value').then((b) => {
                if (b.exists()) {
                    $timeout(() => {
                        $scope.thisUserInRelationship = true;
                    }, 1000);
                }
            });
        }
    });

    let checkOnlinePresense = ConnectFactory.fbPresenceDb.child(userUID).once('value', (x) => {
        if (x.exists()) { $scope.isOnline = true; }
     });

    // Connection & Relationships
    let yourConnReq = ConnectFactory.didYouRequest(ConnectFactory.fbGroupsDb, userLoggedIn, userUID);
    let theirConnReq = ConnectFactory.didTheyRequest(ConnectFactory.fbGroupsDb, userUID, userLoggedIn);
    let completeRequest = $q.all([yourConnReq, theirConnReq]).then(([you, they]) => {
        if (you && they) {
            $scope.AreWeConnected = true;
            let yourRelReq = ConnectFactory.didYouRequest(ConnectFactory.fbRelationshipsDb, userLoggedIn, userUID);
            let theirRelReq = ConnectFactory.didTheyRequest(ConnectFactory.fbRelationshipsDb, userUID, userLoggedIn);
            $q.all([yourRelReq, theirRelReq]).then(([yourRel, theyRel]) => {
                // Relationship
                if (yourRel && theyRel) {
                    $scope.InRelationship = true;
                } else if (yourRel && !theyRel) {
                    $scope.relationshipReqText = 'Relationship Pending';
                    $scope.relationship_button_clicked = true;
                } else if (!yourRel && theyRel) {
                    $scope.respondRelReq = true;
                }
            });
        // Not Connected & No Relationship continue
        } else if (you && !they) {
            $scope.connectReqText = 'Connection Request Pending';
            $scope.connect_button_clicked = true;
        } else if (!you && they) {
            $scope.respondConnReq = true;
        } else if ((you === undefined) && (they === undefined)) {
            $scope.myOwnProfile = true;
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
            ConnectFactory.fbRelationshipsDb.child(userLoggedIn).once('value').then((x) => {
                if (!x.exists()) {
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
            });
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
        // We never allow more than one relationship req. at one time; therefore,
        // we can remove the object at position 0.
        let theirKey = $scope.relationshipData.$keyAt(0);
        ConnectFactory.fbRelationshipsDb.child(userLoggedIn).remove();
        ConnectFactory.fbRelationshipsDb.child(theirKey).remove();
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
                uidfrom: userLoggedIn,
                from: $scope.profile.name,
                content: $scope.update
            });
            $scope.update = '';
        }    
    };

    $scope.saveProfile = () => {
        if (userLoggedIn === userUID) {
            $scope.profile.$save().then(() => {
                $window.location.href = '#!/profile/' + userUID;
            });
        }
    };
    
});

