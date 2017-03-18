"use strict";

app.factory('AuthFactory', function() {

	let currentUser = null;

	let logoutUser = function() {
		console.log("logoutUser");
		return firebase.auth().signOut();
	};

	let isAuthenticated = function () {
		return new Promise (function (resolve, reject) {
			firebase.auth().onAuthStateChanged(function (user) {
				if (user) {
					currentUser = user.uid;
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	};

	let getUser = function() {
		return currentUser;
	};

	let provider = new firebase.auth.GoogleAuthProvider();

	let authWithProvider = function() {
    	return firebase.auth().signInWithPopup(provider);
  	};

	return {
		logoutUser,
		isAuthenticated,
		getUser,
		authWithProvider
	};

});