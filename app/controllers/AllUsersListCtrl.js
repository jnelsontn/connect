'use strict';

app.controller('AllUsersListCtrl', function($scope, $q, $firebaseArray, ConnectFactory, AuthFactory) {

	/*
		this controller displays all the users from the database and splits them into two arrays
		1. your friends 2. non friends. 3. It excludes your own user profile from the list.
		Obviously if the DB had a lot of users this would not be ideal
	 */

	let userLoggedIn = AuthFactory.getUser();
    var allUsersArray = $firebaseArray(ConnectFactory.fbUserDb);
	var x = ConnectFactory.fbGroupsDb;

	allUsersArray.$loaded().then(function(){
	    var promises = [];
	    var friendArr = [];
	    var notFriendArr = [];

	    angular.forEach(allUsersArray, function(user, i) {

		   	var haveIAdded = x.child(userLoggedIn).child(allUsersArray[i].uid).once('value').then(function (snap) {
				if (snap.exists()) {
					return true;
				} else {
					return false;
				}
			});
		            
			var haveTheyAdded = x.child(allUsersArray[i].uid).child(userLoggedIn).once('value').then(function (snap) {
				if (snap.exists()) {
					return true;
				} else {
				    return false; 
				}
			});

	        promises.push(
	            $q.all([haveIAdded, haveTheyAdded]).then(function([you, they]) {
	            	// console.log(you, they);
	                if (you && they) {
	                    friendArr.push(allUsersArray[i]);
	                    //console.log('friend: ', allUsersArray[i]);
	                } else {
	                	//console.log('not Friend', allUsersArray[i]);
	                    notFriendArr.push(allUsersArray[i]);
	                }

	               	if (allUsersArray[i].uid === userLoggedIn) {
	               		//console.log(allUsersArray[i].uid);
						notFriendArr.pop();
	        		}

	            })
	        );

	    });

	    // Promise.all(promises).then(function(){
	       $scope.friendList = friendArr;
	       $scope.notFriendList = notFriendArr;
	       // $scope.$apply();
	    //});
	});

});


//
//
/*    ConnectFactory.fbPresenceDb.child(userUID).once('value', function(snap) {
        if (snap.exists()) {
            $scope.isOnline = true;
            console.log(userUID + ' is online');
        }
     }); */



