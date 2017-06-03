'use strict';

app.controller('OnlineUsersCtrl', function($scope, ConnectFactory) {

	ConnectFactory.fbPresenceDb.on('value', (snap) => {
		$scope.$evalAsync(() => {
			$scope.online_users = snap.val();
		});
	});

});