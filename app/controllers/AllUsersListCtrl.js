'use strict';

app.controller('AllUsersListCtrl', function($scope, $window, $firebaseObject, FilterFactory) {

	/* list all registered users */
	var ref = firebase.database().ref('users');
    console.log('user info from firebase: ', $firebaseObject(ref) );
    $scope.allusers = $firebaseObject(ref);

});