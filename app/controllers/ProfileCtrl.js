'use strict';

app.controller('ProfileCtrl', function($scope, $window, $firebaseObject, $firebaseArray, $routeParams, AuthFactory) {

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
 	var messageRef = fbMessagesDb.child(userUID);
    $scope.messages = $firebaseArray(messageRef);

    $scope.addMessage = () => {
        var message = {
            uid: userLoggedIn,
            from: $scope.userLoggedIn.name,
            content: $scope.message
        };
        var messageKey = messageRef.push().key;
        var messages = {};
        $scope.message = "";
        return messageRef.child(messageKey).update(message);
    };

    $scope.connectReq = "Connect!";

    // we need firebase rules to prevent user from editing own profile
    $scope.myOwnProfile = false;
    if (userLoggedIn === userUID) {
        $scope.myOwnProfile = true;
    }

    if (userLoggedIn !== userUID) {
        // shouldn't see button but just in case...
        $scope.connect = () => {
            // my userid -> and set key in there for who they want to visit
            console.log('added ' + $scope.profile.name + ' as friend.');
            return fbGroupsDb.child(userLoggedIn).child(userUID).set(
            {
                connected: true
            }); 
       };
    }

    var didYouRequest = fbGroupsDb.child(userLoggedIn).child(userUID).once('value').then( function (snapshot) {
    if (userLoggedIn !== userUID) { // we don't send req. or look for ourselves but this kind of messup with promise.all
        if (snapshot.val() !== null) {
            console.log('Did You Request? : Yes');
            return true;
        } else {
            console.log('Did You Request? : No');
            return false; 
        }
    }
    });

    var didTheyRequest = fbGroupsDb.child(userUID).child(userLoggedIn).once('value').then( function (snapshot) {
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
        if (you && they) { // returns you requested them:true and they requested you:true
            // maybe we should add a remove connection button? :)
            console.log('We Are Friends');
            $scope.AreWeFriends = true;
        } else if ((you === true) && (they === false)) {
            console.log('You sent a request. They have not responded.');
            $scope.connectReq = "Request Pending";
        } else if ((you === false) && (they === true)) {
            console.log('They sent you a request. You have not responded.');
            $scope.connectReq = "Respond to Request";
        } else if ((you === undefined) && (they === undefined)) {
            console.log('You are on your profile.');
        } else {
            console.log('We Are Not Friends and no requests have been sent.');
        }
    });

});
