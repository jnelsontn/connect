'use strict';

app.controller('UserCtrl', function ($scope, $window, $routeParams, AuthFactory) {

	$scope.isLoggedIn = false;

	$scope.logout = () => {
		AuthFactory.logoutUser().then(function(data){
			console.log("logged out?", data);
			$window.location.url = "#!/login";
			$scope.isLoggedIn = false;
		}, function(error){
			console.log("error occured on logout");
		});
	};

	//when first loaded, make sure no one is logged in
	if(AuthFactory.isAuthenticated()){
		$scope.logout();
	}

	$scope.loginGoogle = () => {
		let provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
			var dbRef = firebase.database().ref('users');
			var groupRef = firebase.database().ref('groups');
			var user = result.user; 
			var uid = result.user.uid;

			dbRef.child(uid).once('value').then( function (snapshot) {
				var exists = (snapshot.val() !== null);
				if (exists) {
					console.log(uid + ' already exists. do nothing');
				} else {
					// first time params from google
					console.log(user.displayName + ' set-up');
					dbRef.child(uid).set({
						name: user.displayName,
						email: user.email,
						photo: user.photoURL,
						uid: uid
					});
					groupRef.child(uid).set({
						groupOwner: uid
					});
				}
			});

	    	console.log("logged in user: ", uid);
			var token = result.credential.accessToken;

	    	$scope.isLoggedIn = true;
	    	$routeParams.profileId = uid;
	    	$window.location.href = "#!/profile/" + $routeParams.profileId;
		}).catch(function(error) {
			console.log("Error with Google Login", error);
		});
	};

});
