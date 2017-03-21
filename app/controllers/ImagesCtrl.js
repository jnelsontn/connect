'use strict';

app.controller('ImagesCtrl', function($scope, $routeParams, $firebaseArray, AuthFactory, ConnectFactory) {

let userUID = $routeParams.profileId;
let userLoggedIn = AuthFactory.getUser();
let imageDb = ConnectFactory.fbImagesDb.child(userUID);

$scope.photos = $firebaseArray(imageDb);
$scope.myOwnProfile = false;

	if (userLoggedIn === userUID) { $scope.myOwnProfile = true; }

	let imageUploadId = document.getElementById('image-upload');
	if (imageUploadId) {
		imageUploadId.addEventListener('change', (e) => {
			let file = e.target.files[0];
			let imageRef = firebase.storage().ref(userUID).child(file.name);
			console.log('File Properties: ', file);

			imageRef.put(file).then(() => {
				console.log('Successfully Uploaded File!');
				imageRef.getDownloadURL().then((url) => {
					imageDb.push({ photo: url });
				});
			});
		}); 
	}/* end img upload */

});