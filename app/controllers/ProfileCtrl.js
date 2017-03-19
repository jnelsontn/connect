'use strict';

app.controller('ProfileCtrl', function($scope, $window, $timeout, $firebaseObject, $firebaseArray, $routeParams, AuthFactory, ConnectFactory) {

    // button ref. changes once it looks at promises
    $scope.connectReq = "Connect!";

    let userLoggedIn = AuthFactory.getUser();
    $scope.visitorRealName = $firebaseObject(ConnectFactory.fbUserDb.child(userLoggedIn));

    // userUID is the profile we're visiting
    let userUID = $routeParams.profileId;

    $firebaseObject(ConnectFactory.fbUserDb.child(userUID)).$loaded().then(function(x) {
        $scope.profile = x;
    });

    // the messageDB of the user whose profile we're visiting
    $firebaseArray(ConnectFactory.fbMessagesDb.child(userUID)).$loaded().then(function(x) {
        $scope.messages = x;
    });

    $scope.addMessage = function(){
        var date = new Date();
        $scope.messages.$add({
            timestamp: (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(),
            from: $scope.visitorRealName.name,
            content: $scope.message
        });
        $scope.message = '';
    };

    // we need firebase rules to prevent user from editing other profile
    $scope.myOwnProfile = false;
    if (userLoggedIn === userUID) {
        $scope.myOwnProfile = true;
    }

    $scope.saveProfile = function() {
        $scope.profile.$save().then(function() {
            console.log('Profile saved!');
            $window.location.href = "#!/profile/" + userUID;
        }).catch(function(error) {
            console.log('Error Editing Profile');
        });
    };

    if (userLoggedIn !== userUID) {
        // shouldn't see button but just in case...
        $scope.connect = () => {
            // my userid -> and set key in there for who they want to visit
            console.log('Sent ' + $scope.profile.name + ' a connection request.');
            return ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).set(
            { // connected: true isn't relevant but firebase doesn't allow an empty obj...
                connected: true
            }); 
       };
    }

    var didYouRequest = ConnectFactory.fbGroupsDb.child(userLoggedIn).child(userUID).once('value').then( function (snapshot) {
        if (userLoggedIn !== userUID) { // don't check if we added ourselves... we can't
            if (snapshot.val() !== null) {
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
            if (snapshot.val() !== null) {
                console.log('Have they requested You? : Yes');
                return true;
            } else {
                console.log('Have they requested You? : No');
                return false;
            }
        }
    });

    $scope.AreWeFriends = false;
    Promise.all([didYouRequest, didTheyRequest]).then(function([you, they]) {
        if (you && they) {
            console.log('We Are Friends');
            $scope.AreWeFriends = true;
            $scope.$apply();
            // we should push to an array of friends here but we'll also need the logic
            // to remove a friend from the array
        } else if ((you === true) && (they === false)) {
            console.log('You sent a request. They have not responded.');
            $scope.connectReq = "Request Pending";
            $scope.$apply();
            watchChange();
        } else if ((you === false) && (they === true)) {
            $scope.connectReq = "Respond to Request";
            $scope.$apply();
            console.log('They sent you a request. You have not responded.');
        } else if ((you === undefined) && (they === undefined)) {
            console.log('You are on your profile.');
        } else {
            $scope.$apply();
            console.log('We Are Not Friends and no requests have been sent.');
        }
    });

    function watchChange() {
        console.log('watching...');
        $firebaseArray(ConnectFactory.fbGroupsDb.child(userUID).child(userLoggedIn)).$watch(function () {
            console.log($scope.profile.name + " Confirmed Your Friend Request");
        });
    }

    var profileRef = firebase.storage().ref(userUID).child('profile.jpg');
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

