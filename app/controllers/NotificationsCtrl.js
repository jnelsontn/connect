'use strict';

app.controller('NotificationsCtrl', function($scope, $routeParams, $firebaseArray, AuthFactory) {
	let userLoggedIn = AuthFactory.getUser();
	let userUID = $routeParams.profileId;
	let notificationsRef = firebase.database().ref('notifications/' + userLoggedIn);

	if (userLoggedIn === userUID) {
		$scope.myOwnProfile = true;
		$scope.notifications = $firebaseArray(notificationsRef);
	}
});