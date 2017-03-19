'use strict';

app.controller('AllUsersListCtrl', function($scope, $firebaseObject, $firebaseArray, $timeout, ConnectFactory, AuthFactory) {

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
				if (snap.val() !== null) {
					return true;
				} else {
					return false;
				}
			});
		            
			var haveTheyAdded = x.child(allUsersArray[i].uid).child(userLoggedIn).once('value').then(function (snap) {
				if (snap.val() !== null) {
					return true;
				} else {
				    return false; 
				}
			});

	        promises.push(
	            Promise.all([haveIAdded, haveTheyAdded]).then(function([you, they]) {
	                if (you && they) {
	                    friendArr.push(allUsersArray[i]);
	                } else {
	                    notFriendArr.push(allUsersArray[i]);
	                }

	               	if (allUsersArray[i].uid === userLoggedIn) {
						notFriendArr.pop();
	        		}

	            })
	        );

	    });

	    Promise.all(promises).then(function(){
	       $scope.friendList = friendArr;
	       $scope.notFriendList = notFriendArr;
	       $scope.$apply();
	    });
	});



});

