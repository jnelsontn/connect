'use strict';

app.controller('ImagesCtrl', function($scope, $routeParams, $firebaseObject, AuthFactory, ConnectFactory) {

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
$scope.images = $firebaseObject(fbImageDb);

    // image upload for changing profile pic...
  $("#image-upload").change(function(e) {

    var file = e.target.files[0];
    console.log(file);

    let imageRef = firebase.storage().ref(userUID).child(file.name);
    imageRef.put(file).then(function(snapshot) {
    console.log('Uploaded File!');

      imageRef.getDownloadURL().then(function(url) {
        console.log('is this working?', url);
        fbImageDb.push({
          photo: url
        });
      });

    });

  });

console.log($scope.images);

});