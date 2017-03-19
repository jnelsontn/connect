"use strict";

app.controller('NavCtrl', function($scope, $window, $firebaseObject, AuthFactory, FilterFactory) {
	$scope.searchText = FilterFactory;
	$scope.isLoggedIn = false;

	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			$scope.isLoggedIn = true;
      $scope.userLoggedInProfile = user.uid;

      var listRef = firebase.database().ref('presence/' + user.uid);
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

      // Number of online users is the number of objects in the presence list.
      firebase.database().ref('presence').on('value', function(snap) {
        $scope.$evalAsync(function() {
          $scope.usersOnline = snap.numChildren();
        });
      });


		} else {
      $scope.isLoggedIn = false;
			$window.location.href = "#!/login";
		}

	}); /* end fb auth */



});
