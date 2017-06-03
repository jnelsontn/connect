'use strict';

app.controller('OnlineUsersCtrl', function($scope, $firebaseArray, $q, $firebaseObject, $timeout, AuthFactory, ConnectFactory) {

	let online_users = firebase.database().ref('presence');
	online_users.on('value', (snap) => {
		$scope.$evalAsync(() => {
			console.log( snap.key, ':', snap.val());
			$scope.online_users = snap.val();
		});
	});

});

