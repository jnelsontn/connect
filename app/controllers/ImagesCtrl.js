'use strict';

app.controller('ImagesCtrl', function($scope, $routeParams, $firebaseArray, AuthFactory, ConnectFactory) {

let userUID = $routeParams.profileId;
let userLoggedIn = AuthFactory.getUser();
let imageDb = ConnectFactory.fbImagesDb.child(userUID);

$scope.photos = $firebaseArray(imageDb);
$scope.myOwnProfile = false;

	if (userLoggedIn === userUID) {
		$scope.myOwnProfile = true;
		let uploadAnImage = ConnectFactory.imageUpload('#image-upload', userUID, imageDb);
	}

	$scope.deleteSpecificPhoto = (photo) => {
		$scope.photos.$remove(photo);

		let deleteRef = firebase.storage().ref(userUID).child(photo.filename);
		deleteRef.delete().then(() => {
			console.log('Photo Successfully Deleted');
		});
	};

});
