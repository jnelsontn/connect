'use strict';

app.controller('NavCtrl', function($scope, $window, $firebaseArray, ngToast, ConnectFactory) {
	$scope.isLoggedIn = false;

    firebase.auth().onAuthStateChanged((user) => {
    	if (user) {
        	$scope.isLoggedIn = true;
            $scope.userLoggedInProfile = user.uid;

            let listRef = ConnectFactory.fbPresenceDb.child(user.uid);
            let userRef = listRef.push();

            // Add Ourselves to Presence List while Online
            let presenceRef = firebase.database().ref('.info/connected');
            presenceRef.on('value', (x) => {
                if (x.exists()) {
                // Remove Ourselves on Disconnect.
                    userRef.onDisconnect().remove();
                    userRef.set(true);
                }
            });

            // Number of Users Online
            ConnectFactory.fbPresenceDb.on('value', (x) => {
                $scope.$evalAsync(() => {
                    $scope.usersOnline = x.numChildren();
                });
            });
            
            // Pull user's notifications and display in a 'Toast.'
            let rootRef = firebase.database().ref('notifications/' + user.uid);
            let limitedRootRef = rootRef.limitToLast(1);
            $firebaseArray(limitedRootRef).$loaded().then((x) => {
                $scope.notifications = x;
                ngToast.create({
                    content: '{{notice.content}}',
                    compileContent: true,
                    className: 'alert alert-info'
                });
            });

            // Number of User's Online
            let notifChrldCnt = rootRef.on('value', (x) => {
                $scope.$evalAsync(() => {
                    $scope.notificationNumber = x.numChildren();
                });
            });
    	} else {
            $scope.isLoggedIn = false;
            $window.location.href = '#!/login';
    	}
    }); // End Authorization

});





