"use strict";

app.controller('NavCtrl', function($scope, $window, $routeParams, AuthFactory, FilterFactory) {
	$scope.searchText = FilterFactory;
	$scope.isLoggedIn = false;

	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			$scope.isLoggedIn = true;
			$scope.userLoggedInProfile = user.uid;
			console.log('NavCtrl Logged In User: ', user.displayName);
			// console.log("User logged in? ", user, $scope.isLoggedIn);
		} else {
			$scope.isLoggedIn = false;
			// console.log("User logged in? ", $scope.isLoggedIn);
			$window.location.href = "#!/login";
		}
	});

});