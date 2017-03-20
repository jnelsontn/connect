'use strict';

app.controller('ProfileCtrl', function($scope, $window, $q, $route, $firebaseObject, $firebaseArray, $routeParams, AuthFactory, ConnectFactory) {

    let userLoggedIn = AuthFactory.getUser();
    let date = new Date();
    let userUID = $routeParams.profileId;
    let profileRef = firebase.storage().ref(userUID).child('profile.jpg');

    $scope.visitorRealName = $firebaseObject(ConnectFactory.fbUserDb.child(userLoggedIn));
    $scope.connectReqText = "Connect!";
    $scope.respondReqText = "Respond to Request";
    $scope.isOnline = false;
    $scope.myOwnProfile = false;
    $scope.AreWeFriends = false;
    $scope.button_clicked = false;
    $scope.respondReq = false;

    if (userLoggedIn === userUID) {
        $scope.myOwnProfile = true;
    }

    $firebaseObject(ConnectFactory.fbUserDb.child(userUID)).$loaded().then(function(x) {
        $scope.profile = x;
    });

    // the messageDB of the user whose profile we're visiting
    $firebaseArray(ConnectFactory.fbMessagesDb.child(userUID)).$loaded().then(function(x) {
        $scope.messages = x;
    });

    $firebaseArray(ConnectFactory.fbStatusUpdatesDb.child(userUID)).$loaded().then(function(x) {
        $scope.updates = x;
    });

    ConnectFactory.fbPresenceDb.child(userUID).once('value', function(snap) {
        if (snap.exists()) {
            $scope.isOnline = true;
            console.log(userUID + ' is online');
        }
     });

    var didYouRequest = ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).once('value').then( function (snapshot) {
        if (userLoggedIn !== userUID) {
            if (snapshot.exists()) {
                console.log('Did You Send Request? : Yes');
                return true;
            } else {
                console.log('Did You Send Request? : No');
                return false; 
            }
        }
    });

    var didTheyRequest = ConnectFactory.fbGroupsDb.child(userUID).child(userLoggedIn).once('value').then( function (snapshot) {
       if (userLoggedIn !== userUID) {
            if (snapshot.exists()) {
                console.log('Have they requested You? : Yes');
                return true;
            } else {
                console.log('Have they requested You? : No');
                return false;
            }
        }
    });

    $q.all([didYouRequest, didTheyRequest]).then(function([you, they]) {
        // console.log(you, they);
        if ((you === true) && (they === true)) {
            $scope.AreWeFriends = true;
            console.log('We are Friends?', $scope.AreWeFriends);
            //watchChange();
        } else if ((you === true) && (they === false)) {
            console.log('You sent a request. They have not responded.');
            //watchChange();
            $scope.connectReqText = "Request Pending";
            $scope.button_clicked = true;
        } else if ((you === false) && (they === true)) {
            $scope.respondReq = true;
            console.log('They sent you a request. You have not responded.');
            // watchChange();
        } else if ((you === undefined) && (they === undefined)) {
            console.log('You are on your profile.');
            $scope.myOwnProfile = true;
        } else {
            console.log('We Are Not Friends and no requests have been sent.');
        }
    });

    $scope.respondToRequest = () => {
        ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set(
        { // Not used by Firebase does not allow an empty 'object'
            connected: true
        });
        $route.reload();
    };

    $scope.connect = () => {
        if (userLoggedIn !== userUID) {

            ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set(
            { // Not used by Firebase does not allow an empty 'object'
                connected: true
            });
            watchChange();

          /*  var ref = ConnectFactory.fbMessagesDb.child(userUID);
            var obj = {
                timestamp: (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(),
                from: $scope.visitorRealName.name,
                content: 'Sent You A Friend Request, click to confirm'
            };
            ref.push(obj); */

            //sendUidReq = (uidSent, msg)
            var msg = $scope.visitorRealName.name + ' Sent You A Friend Request';
            // person we sent to, person sent from, msg
            ConnectFactory.sendUidReq(userUID, userLoggedIn, msg);

            $scope.connectReqText = "Request Pending";
            $scope.button_clicked = true;
        } /* enduserloggedin */
    };

    $scope.addMessage = function(){
        $scope.messages.$add({
            timestamp: date.toLocaleString(),
            from: $scope.visitorRealName.name,
            content: $scope.message
        });
        $scope.message = '';
        if (userLoggedIn !== userUID) {
            var x = $scope.visitorRealName.name + ' wrote on your profile.';
            ConnectFactory.sendUidReq(userUID, userLoggedIn, x);
        }
    };

    $scope.userUpdateStatus = function(){
        if (userLoggedIn === userUID) {
            $scope.updates.$add({
                timestamp: date.toLocaleString(),
                from: $scope.profile.name,
                content: $scope.update
            });
            $scope.update = '';
        }
        /* $scope.message = '';
        if (userLoggedIn !== userUID) {
            var x = $scope.visitorRealName.name + ' wrote on your profile.';
            ConnectFactory.sendUidReq(userUID, userLoggedIn, x);
        } */
    };

/*                 // person we send to, person sent from, msg
                ConnectFactory.sendUidReq(userLoggedIn, userUID, msg); */

    $scope.saveProfile = function() {
        $scope.profile.$save().then(function() {
            console.log('Profile saved!');
            $window.location.href = "#!/profile/" + userUID;
        }).catch(function(error) {
            console.log('Error Editing Profile');
        });
    };

    // UserLoggedIn gets this message sent back when userUID confirms
    function watchChange() {
        console.log('Waiting for Other User to Accept Connection Request');
        ConnectFactory.fbGroupsDb.child(userUID).child(userLoggedIn).on('value', function (snap) {
            if (snap.exists()) {
                // console.log(snap.val());
                console.log($scope.profile.name + ' Confirmed Request');
                var msg = $scope.profile.name + ' Confirmed Request';
                // person we send to, person sent from, msg
                ConnectFactory.sendUidReq(userLoggedIn, userUID, msg);
            }
        });
    }

    // image upload for changing profile pic...
    $("#the-file-input").change(function(e) {

        var file = e.target.files[0];
        console.log(file);

        profileRef.put(file).then(function(snapshot) {
            console.log('Uploaded File!');

            profileRef.getDownloadURL().then(function(url) {
                ConnectFactory.fbUserDb.child(userLoggedIn).update(
                {
                    photo: url
                });
            });
        });

    });

});

