'use strict';

app.controller('ImagesCtrl', function($scope, $routeParams, $firebaseArray, AuthFactory, ConnectFactory) {

let userUID = $routeParams.profileId;
let userLoggedIn = AuthFactory.getUser();

  $scope.myOwnProfile = false;
  if (userLoggedIn === userUID) {
    console.log('my images');
    $scope.myOwnProfile = true;
  } else {
    console.log('not my images');
  }

// root -> images -> uid -> obj-ref
let fbImageDb = firebase.database().ref('images').child(userUID);
$scope.images = $firebaseArray(fbImageDb);

    // image upload for changing profile pic...
  $("#image-upload").change(function(e) {
    $scope.myOwnProfile = true;
    $scope.$apply();
    var file = e.target.files[0];
    var imageRef = firebase.storage().ref(userUID).child(file.name);
    console.log(file);

    imageRef.put(file).then(function(snapshot) {
      console.log('Uploaded File!');
      imageRef.getDownloadURL().then(function(url) {
        fbImageDb.push({
          photo: url
        });

      });

    });
  }); /* end img upload */

});