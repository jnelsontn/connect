'use strict';

app.controller('NotificationsCtrl', function($scope, $firebaseArray, ConnectFactory, AuthFactory) {
            
	let userLoggedIn = AuthFactory.getUser();

	var notificationsRef = firebase.database().ref('notifications/' + userLoggedIn);
	$firebaseArray(notificationsRef).$loaded().then(function(x) {
		$scope.notifications = x;
	});

});