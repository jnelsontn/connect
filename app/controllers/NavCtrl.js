"use strict";

app.controller('NavCtrl', function($scope, $window, $firebaseObject, $firebaseArray, AuthFactory, ConnectFactory, FilterFactory) {
	$scope.searchText = FilterFactory;
	$scope.isLoggedIn = false;

    firebase.auth().onAuthStateChanged(function (user) {
    	if (user) {
        	$scope.isLoggedIn = true;
            $scope.userLoggedInProfile = user.uid;

            var listRef = ConnectFactory.fbPresenceDb.child(user.uid);
            var userRef = listRef.push();

            // Add ourselves to presence list when online.
            var presenceRef = firebase.database().ref('.info/connected');
            presenceRef.on("value", function(snap) {
                if (snap.val()) {
                // Remove ourselves when we disconnect.
                    userRef.onDisconnect().remove();
                    userRef.set(true);
                }
            });

            // Number of Users Online
            ConnectFactory.fbPresenceDb.on('value', function(snap) {
                $scope.$evalAsync(function() {
                    $scope.usersOnline = snap.numChildren();
                });
            });
            
            /* only show one result in our notification window */
            var rootRef = firebase.database().ref('notifications/' + user.uid);
            var limitedRootRef = rootRef.limitToLast(1);
            $firebaseArray(limitedRootRef).$loaded().then(function(x) {
                $scope.notifications = x;
            });

            var notifChrldCnt = rootRef.on('value', function(x) {
                $scope.$evalAsync(function() {
                    $scope.notificationNumber = x.numChildren();
                });
            });

    	} else {
            $scope.isLoggedIn = false;
            $window.location.href = "#!/login";
    	}

    }); /* end fb auth */

});

/*      firebase.database().ref('notifications/' + user.uid).on('value', function(snap){
        $scope.$apply(function(){
          console.log(snap.val());
          $scope.notifications = snap.val();
        });

      }); */