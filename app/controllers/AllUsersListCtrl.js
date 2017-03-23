'use strict';

app.controller('AllUsersListCtrl', function($scope, $q, $firebaseArray, ConnectFactory, AuthFactory) {

	// Pull a list of *ALL* Users, Split into two Groups (Connections, Non-Connections), 
	// Remove the Current User's Listing and Display results to the Current User.

	let userLoggedIn = AuthFactory.getUser();
	let allUsersArray = $firebaseArray(ConnectFactory.fbUserDb);
	let x = ConnectFactory.fbGroupsDb;

	allUsersArray.$loaded().then(() => {
	    let combinedArr = [];
	    let connectedArr = [];
	    let notConnectedArr = [];

	    angular.forEach(allUsersArray, (user, i) => {

		   	let haveIAdded = x.child(userLoggedIn).child(allUsersArray[i].uid)
		   	.once('value').then((x) => {
				if (x.exists()) {
					return true;
				} else {
					return false;
				}
			});
		            
			let haveTheyAdded = x.child(allUsersArray[i].uid).child(userLoggedIn)
			.once('value').then((x) => {
				if (x.exists()) {
					return true;
				} else {
				    return false; 
				}
			});

	        let finalPush = combinedArr.push(
	            $q.all([haveIAdded, haveTheyAdded]).then(([you, they]) => {
	                if (you && they) {
	                    connectedArr.push(allUsersArray[i]);
	                } else {
	                    notConnectedArr.push(allUsersArray[i]);
	                }

	               	if (allUsersArray[i].uid === userLoggedIn) {
						notConnectedArr.pop();
	        		}
			}));
	    });
		$scope.connectedList = connectedArr;
		$scope.notConnectedList = notConnectedArr;
	});

});



