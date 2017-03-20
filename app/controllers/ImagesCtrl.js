'use strict';

app.controller('ImagesCtrl', function($scope, $routeParams, $firebaseArray, AuthFactory, ConnectFactory) {

let userUID = $routeParams.profileId;
let userLoggedIn = AuthFactory.getUser();
let imageDb = ConnectFactory.fbImagesDb.child(userUID);

$scope.images = $firebaseArray(imageDb);
$scope.myOwnProfile = false;

	if (userLoggedIn === userUID) {
		console.log('my images');
		$scope.myOwnProfile = true;
	} else {
		console.log('not my images');
	}

	$("#image-upload").change(function(e) {
		var file = e.target.files[0];
		var imageRef = firebase.storage().ref(userUID).child(file.name);
		console.log(file);

		imageRef.put(file).then(function(snapshot) {
			console.log('Uploaded File!');
			imageRef.getDownloadURL().then(function(url) {
				imageDb.push({
					photo: url
				});
			});
		});
	}); /* end img upload */

});