'use strict';

app.factory('DataFactory', ($q, $http, $firebaseArray, $firebaseObject, FBCreds, AuthFactory) => {


let getMessages = (user) => {

	console.log('we only want the users messages on their profile');


};

});
/*
app.factory("Profile", ["$firebaseObject",
  function($firebaseObject) {
    return function(username) {
      // create a reference to the database node where we will store our data
      var ref = firebase.database().ref("rooms").push();
      var profileRef = ref.child(username);

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
]); */

/*
var usersRef = firebase.database().ref('users');
var users = $firebaseArray(usersRef);
var Users = {
  getProfile: function(uid){
    return $firebaseObject(usersRef.child(uid));
  },
  getDisplayName: function(uid){
    return users.$getRecord(uid).displayName;
  },
  all: users
};


return Users; */
