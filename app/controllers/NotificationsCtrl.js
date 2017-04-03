'use strict';

app.controller('NotificationsCtrl', function($scope, $firebaseArray, AuthFactory) {
	let userLoggedIn = AuthFactory.getUser();
	let notificationsRef = firebase.database().ref('notifications/' + userLoggedIn);
	$scope.notifications = $firebaseArray(notificationsRef);
});