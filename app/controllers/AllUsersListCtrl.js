'use strict';

app.controller('AllUsersListCtrl', function($scope, $firebaseObject, ConnectFactory) {

    console.log('user info from firebase: ', $firebaseObject(ConnectFactory.fbUserDb) );
    $scope.allusers = $firebaseObject(ConnectFactory.fbUserDb);

});