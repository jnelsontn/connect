'use strict';

app.controller('ProfileCtrl', function($scope, $location, $window, $q, $route, $firebaseObject, $firebaseArray, 
    $routeParams, AuthFactory, ConnectFactory) {

    let date = new Date();
    let userLoggedIn = AuthFactory.getUser();
    let userUID = $routeParams.profileId;

    $scope.visitorRealName = $firebaseObject(ConnectFactory.fbUserDb.child(userLoggedIn));
    $scope.connectReqText = 'Request Connection';
    $scope.respondReqText = 'Respond to Request';
    $scope.isOnline = false;
    $scope.myOwnProfile = false;
    $scope.AreWeConnected = false;
    $scope.button_clicked = false;
    $scope.respondReq = false;

    $firebaseObject(ConnectFactory.fbUserDb.child(userUID)).$loaded().then((x) => { $scope.profile = x; });
    $firebaseArray(ConnectFactory.fbMessagesDb.child(userUID)).$loaded().then((x) => { $scope.messages = x; });
    $firebaseArray(ConnectFactory.fbStatusUpdatesDb.child(userUID)).$loaded().then((x) => { $scope.updates = x; });

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

    // Func. Expression for 'Connection' Request.
    let didYouRequest = ConnectFactory.didYouRequest(userLoggedIn, userUID);
    let didTheyRequest = ConnectFactory.didTheyRequest(userUID, userLoggedIn);

    let completeRequest = $q.all([didYouRequest, didTheyRequest]).then(([you, they]) => {
        if (you && they) {
            $scope.AreWeConnected = true;
            console.log('We are Connected: ', $scope.AreWeConnected);
        } else if (you && !they) {
            $scope.connectReqText = 'Request Pending';
            $scope.button_clicked = true;
            console.log('You sent a request. They have not responded.');
        } else if (!you && they) {
            $scope.respondReq = true;
            console.log('They sent you a request. You have not responded.');
        } else if ((you === undefined) && (they === undefined)) {
            $scope.myOwnProfile = true;
            console.log('Your Own Profile');
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
            ConnectFactory.watchChange(userUID, userLoggedIn, $scope.profile.name);

            $scope.connectReqText = 'Request Pending';
            $scope.button_clicked = true;
        }
    };

    // Respond to a Connection Request & Reload the Page 
    $scope.respondToRequest = () => {
        ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set({ connected: true });
        $route.reload();
    };

    $scope.removeConnection = () => {
        // Remove both User's keys under root->groups->uid->other-user
        ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).remove();
        ConnectFactory.fbGroupsDb.child(userUID).child(userLoggedIn).remove();
        $route.reload();
    };

    $scope.addMessage = () => {
        // Do we need an Auth Check?
        $scope.messages.$add({
            uidfrom: userLoggedIn,
            uidto: userUID,
            timestamp: date.toLocaleString(),
            from: $scope.visitorRealName.name,
            content: $scope.message
        });
        $scope.message = '';
        // Send a Notification to the Reciever of the Message
        if (userLoggedIn !== userUID) {
            let x = $scope.visitorRealName.name + ' Wrote on your Profile.';
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

