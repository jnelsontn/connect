'use strict';

app.factory('AuthFactory', function($q) {

	let currentUser = null;

	let logoutUser = () => { return firebase.auth().signOut(); };

	let isAuthenticated = () => {
		return $q((resolve) => {
			firebase.auth().onAuthStateChanged((user) => {
				if (user) {
					currentUser = user.uid;
					resolve(true);
				} else {
					console.log('No User Authenticated.');
					resolve(false);
				}
			});
		});
	};

	let getUser = () => { return currentUser; };

	let provider = new firebase.auth.GoogleAuthProvider();

	let authWithProvider = () => { return firebase.auth().signInWithPopup(provider); };

	return { logoutUser, isAuthenticated, getUser, authWithProvider };

});