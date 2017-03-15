'use strict';

app.controller('OtherProfileCtrl', function($scope, $window, $firebaseObject, $firebaseArray, $routeParams, AuthFactory) {

	// Ref to our Db
	let fbUserDb = firebase.database().ref('users');
	let fbMessagesDb = firebase.database().ref('messages');

	/// current loggedin user, scope them and make them a fb obj
	let userLoggedIn = AuthFactory.getUser();
	$scope.userLoggedIn = $firebaseObject(fbUserDb.child(userLoggedIn));

	// the userUID is the profile we're visiting
	let userUID = $routeParams.profileId;
    let userUidDbRef = fbUserDb.child(userUID);
    $scope.profile = $firebaseObject(userUidDbRef);
    console.log('user info from firebase: ', $scope.profile );

 	var messageRef = fbMessagesDb.child(userUID);
    $scope.messages = $firebaseArray(messageRef);
    // console.log('$scope.messages is: ', $scope.messages );

    // message is added to root/messages/userUID/key/ 
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


});
