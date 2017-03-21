'use strict';

app.controller('AllUsersListCtrl', function($scope, $q, $firebaseArray, ConnectFactory, AuthFactory) {

	// Pull a List of *ALL* Users, Split into two Groups (Connections, Non-Connections), 
	// Remove the Current User's Listing and Display to the Current User.

	let userLoggedIn = AuthFactory.getUser();
    let allUsersArray = $firebaseArray(ConnectFactory.fbUserDb);
	let x = ConnectFactory.fbGroupsDb;

	allUsersArray.$loaded().then(() => {
	    let combinedArr = [];
	    let connectedArr = [];
	    let notConnectedArr = [];

	    angular.forEach(allUsersArray, (user, i) => {

		   	let haveIAdded = x.child(userLoggedIn).child(allUsersArray[i].uid).once('value')
		   	.then((x) => {
				if (x.exists()) {
					return true;
				} else {
					return false;
				}
			});
		            
			let haveTheyAdded = x.child(allUsersArray[i].uid).child(userLoggedIn).once('value')
			.then((x) => {
				if (x.exists()) {
					return true;
				} else {
				    return false; 
				}
			});

	        combinedArr.push(
	            $q.all([haveIAdded, haveTheyAdded]).then(([you, they]) => {
	                if (you && they) {
	                    connectedArr.push(allUsersArray[i]);
	                    //console.log('friend: ', allUsersArray[i]);
	                } else {
	                	//console.log('not Friend', allUsersArray[i]);
	                    notConnectedArr.push(allUsersArray[i]);
	                }

	               	if (allUsersArray[i].uid === userLoggedIn) {
	               		// console.log(allUsersArray[i].uid);
						notConnectedArr.pop();
	        		}
			}));
	    });
		$scope.connectedList = connectedArr;
		$scope.notConnectedList = notConnectedArr;
	});

});



