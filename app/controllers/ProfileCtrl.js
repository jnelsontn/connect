'use strict';

app.controller('ProfileCtrl', function($scope, $window, $firebaseObject, $firebaseArray, AuthFactory) {

	let user = AuthFactory.getUser();
    
   	var userRef = firebase.database().ref('users');
 	$scope.profile = $firebaseObject(userRef.child(user));
 	console.log ('$scope.profile is: ', $scope.profile);

 	// this would $scope only the logged in users messages... not good, should be the pg we're on
 	var messageRef = firebase.database().ref('messages').child(user);
    $scope.messages = $firebaseArray(messageRef);
    console.log('$scope.messages is: ', $scope.messages );

    // message is added to root/messages/uid/key/ 
    $scope.addMessage = () => {
    	var message = {
    		uid: user,
        	from: $scope.profile.name,
        	content: $scope.message
    	};
    	var messageKey = messageRef.push().key;
    	var messages = {};
		$scope.message = "";
    	return messageRef.child(messageKey).update(message);
    }; 

});


    /* AngularFire cannot do this */
	/* $scope.addMessage = () => {
      $scope.messages.$add({
    	uid: user,
        from: $scope.profile.name,
        content: $scope.message
      }).then( (e) => {
      	console.log('please resolve?');
      }); 
     $scope.message = "";
 	}; */