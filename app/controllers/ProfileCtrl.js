'use strict';

app.controller('ProfileCtrl', function($scope, $window, $firebaseObject, $firebaseArray, $firebaseStorage, $routeParams, AuthFactory) {

    // button ref. changes once it looks at promises
    $scope.connectReq = "Connect!";

	// Ref to our Db
	let fbUserDb = firebase.database().ref('users');
	let fbMessagesDb = firebase.database().ref('messages');
    let fbGroupsDb = firebase.database().ref('groups');

	/// get the current logged in user
	let userLoggedIn = AuthFactory.getUser();
	$scope.userLoggedIn = $firebaseObject(fbUserDb.child(userLoggedIn));

	// userUID is the profile we're visiting
	let userUID = $routeParams.profileId;
    let userUidDbRef = fbUserDb.child(userUID);
    $scope.profile = $firebaseObject(userUidDbRef);
    //console.log('visiting the profile of ', userUID);

    // the messageDB of the user whose profile we're visiting
 	let messageRef = fbMessagesDb.child(userUID);
    $scope.messages = $firebaseArray(messageRef);

    $scope.addMessage = () => {
        var date = new Date(); // this probably sets the ts in the db to the user's computer date ;)
        var message = {
            timestamp: (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(),
            uid: userLoggedIn,
            from: $scope.userLoggedIn.name,
            content: $scope.message
        };
        var messageKey = messageRef.push().key;
        $scope.message = "";
        return messageRef.child(messageKey).update(message);
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
            return fbGroupsDb.child(userLoggedIn).child(userUID).set(
            { // connected: true isn't relevant but firebase doesn't allow an empty obj...
                connected: true
            }); 
       };
    }

    var didYouRequest = fbGroupsDb.child(userLoggedIn).child(userUID).once('value').then( function (snapshot) {
        if (userLoggedIn !== userUID) { // don't check if we added ourselves... we can't
            if (snapshot.val() !== null) {
                console.log('Did You Send Request? : Yes');
                $scope.connectReq = "Request Pending";
                return true;
            } else {
                console.log('Did You Send Request? : No');
                return false; 
            }
        }
    });
 
    var didTheyRequest = fbGroupsDb.child(userUID).child(userLoggedIn).once('value').then( function (snapshot) {
        if (userLoggedIn !== userUID) {
            if (snapshot.val() !== null) {
                console.log('Have they requested You? : Yes');
                $scope.connectReq = "Respond to Request";
                return true;
            } else {
                console.log('Have they requested You? : No');
                return false;
            }
        }
    });

    $scope.AreWeFriends = false;
    Promise.all([didYouRequest, didTheyRequest]).then(function([you, they]) {
        if (you && they) { // returns you requested them:true and they requested you:true
            // maybe we should add a remove connection button? a ng-if in profile tells us we are friends
            console.log('We Are Friends');
            $scope.AreWeFriends = true;
        } else if ((you === true) && (they === false)) {
            console.log('You sent a request. They have not responded.');
            watchChange();
        } else if ((you === false) && (they === true)) {
            console.log('They sent you a request. You have not responded.');
        } else if ((you === undefined) && (they === undefined)) {
            console.log('You are on your profile.');
        } else {
            console.log('We Are Not Friends and no requests have been sent.');
        }
    });

    // If they confirm us, give us a notification.
    // I think this needs more testing, we call it above.
    function watchChange() {
        console.log('watching...');
        $firebaseArray(fbGroupsDb.child(userUID).child(userLoggedIn)).$watch(function () {
            console.log($scope.profile.name + " Confirmed Your Friend Request");
        });
    }


});
