'use strict';

app.controller('UserCtrl', function ($scope, $window, $routeParams, AuthFactory, ConnectFactory) {

	$scope.isLoggedIn = false;

	$scope.logout = () => {
		AuthFactory.logoutUser().then((data) => {
			$window.location.url = "#!/login";
			$scope.isLoggedIn = false;
		});
	};

	// Onload - Ensure all User's are Logged Out
	if (AuthFactory.isAuthenticated()) { $scope.logout(); }

	$scope.loginGoogle = () => {
		let provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then((result) => {
			let user = result.user; 
			let uid = result.user.uid;

			ConnectFactory.fbUserDb.child(uid).once('value').then((x) => {
				if (x.exists()) {
					console.log(uid + ' already exists. do nothing');
				} else {
					// Initial Set-Up Only - Get Google Profile
					console.log(user.displayName + ' set-up');
					ConnectFactory.fbUserDb.child(uid).set({
						name: user.displayName,
						email: user.email,
						photo: user.photoURL,
						uid: uid
					});
					ConnectFactory.fbGroupsDb.child(uid).set({
						groupOwner: uid
					});
				}
			});

	    	console.log("User Logged In: ", uid);
			let token = result.credential.accessToken;

	    	$scope.isLoggedIn = true;
	    	$routeParams.profileId = uid;
	    	$window.location.href = "#!/profile/" + $routeParams.profileId;
		}).catch((error) => { console.log("Error with Google Login", error); });
	};

});
