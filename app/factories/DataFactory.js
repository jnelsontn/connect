'use strict';

app.factory('DataFactory', ($q, $http, FBCreds, AuthFactory) => {

	let getUserInfo = (user) => {
		return $q (function (resolve, reject) {
			$http.get(`${FBCreds.databaseURL}/users.json?orderBy="uid"&equalTo="${user}"`)
			.then(function (dataRecieved) {
				resolve (dataRecieved.data);
			}).catch (function (error) {
				reject (error);
			});
		});
	};

	let getAllUsers = () => {
		return $q (function (resolve, reject) {
			$http.get(`${FBCreds.databaseURL}/users.json?orderBy="uid"`)
			.then(function (dataRecieved) {
				resolve (dataRecieved);
			}).catch (function (error) {
				reject (error);
			});
		});
	};

	return {
		getUserInfo,
		getAllUsers
	};

});





