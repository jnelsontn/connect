'use strict';

// login, logout, register, loginGoogle, conditional, authfactory
app.controller('UserCtrl', function ($scope, $window, AuthFactory) {

	$scope.isLoggedIn = false;

	$scope.account = {
		email: '',
		password: ''
	};

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
			var user = result.user; 
			var uid = result.user.uid;

			dbRef.child(uid).once('value').then( function (snapshot) {
				var exists = (snapshot.val() !== null);
				if (exists) {
					console.log(user.displayName + ' already exists. do nothing');
				} else {
					// first time params from google
					console.log(user.displayName + ' set-up');
					dbRef.child(uid).set({
						name: user.displayName,
						email: user.email,
						photo: user.photoURL,
						uid: uid
					});
				}
			});

	    	console.log("logged in user: ", uid);
			var token = result.credential.accessToken;

	    	$scope.isLoggedIn = true;
	    	$window.location.href = "#!/profile/";

		}).catch(function(error) {
			console.log("error with google login", error);
		});
	};

  	$scope.login = () => {
    	AuthFactory.loginUser($scope.account)
	    .then( () => {
	    	console.log("UserCtrl: user is loggedIn", $scope.isLoggedIn );
	        $scope.isLoggedIn = true;
	        $window.location.href = "#!/profile/";
	    });
	};

	$scope.register = () => {
	    AuthFactory.createUser({
	      email: $scope.account.email,
	      password: $scope.account.password
	    }).then((userData) => {
	      console.log('UserCtrl newUser: ', userData );
	      $scope.login();
	    }, (error) => {
	        console.log('Error creating user: ', error);
	    });
  	};

});



	/*	AuthFactory.authWithProvider().then(function(result) {
			console.log('logingoogle authwithprovider: ', result);
	    	console.log("logged in user: ", result.user.uid);
	    		// may do something with google token
	    		var token = result.credential.accessToken;
	    	//Once logged in, go to another view
	    	$scope.isLoggedIn = true;
	    	$window.location.href = "#!/profile/";
	  	}).catch(function(error) {
	    	console.log("error with google login", error);
	  	});
	}; */
