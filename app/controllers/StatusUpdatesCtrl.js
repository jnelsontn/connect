'use strict';

app.controller('StatusUpdatesCtrl', function($scope, $firebaseArray, ConnectFactory) {

	$firebaseArray(ConnectFactory.fbStatusUpdatesDb).$loaded().then(() => {
		let newArr = []; 
		ConnectFactory.fbStatusUpdatesDb.on('child_added', (x) => {
	 		let data = x.val();
	 		Object.keys(data).map((key) => {
	 			newArr.push(data[key]);
			});
		});
		$scope.statusupdates = newArr;
	});

});