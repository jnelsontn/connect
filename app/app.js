'use strict';

var app = angular.module('Connect', ['firebase', 'ngRoute', 'ngToast']);

// Ensure User is Authenticated for Viewing Pages
let isAuth = ($q, AuthFactory) => {
    return $q((resolve, reject) => {
        AuthFactory.isAuthenticated().then((userExists) => {
            if (userExists){
                resolve();
            } else {
                reject();
            }
        });
    });
};

// Only Profile Owner May Edit
let pageAuth = ($q, AuthFactory, $routeParams) => {
    return $q((resolve, reject) => {
        let currentUser = AuthFactory.getUser();
        let currentUrl = $routeParams.profileId;
        if (currentUser === currentUrl) {
            resolve(true);
        } else {
            reject(false);
        }
    });
};

app.config(($routeProvider) => {
    $routeProvider.when('/', {
        templateUrl: 'templates/login.html',
        controller: 'UserCtrl'
    }).
    when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'UserCtrl'
    }).
    when('/logout', {
        templateUrl: 'templates/login.html',
        controller: 'UserCtrl'
    }).
    when('/profile/:profileId', {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl',
        resolve: {isAuth}
    }).
    when('/profile/:profileId/edit', {
        templateUrl: 'templates/editprofile.html',
        controller: 'ProfileCtrl',
        resolve: {isAuth, pageAuth}
    }).
    when('/profile/:profileId/notifications', {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsCtrl',
        resolve: {isAuth, pageAuth}
    }).
    when('/profile/:profileId/images', {
        templateUrl: 'templates/images.html',
        controller: 'ImagesCtrl',
        resolve: {isAuth}
    }).
    when('/global-status-updates', {
        templateUrl: 'templates/global-status-updates.html',
        controller: 'StatusUpdatesCtrl',
        resolve: {isAuth}
    }).
    when('/onlineusers', {
        templateUrl: 'templates/onlineusers.html',
        controller: 'OnlineUsersCtrl',
        resolve: {isAuth}
    }).
    when('/allusers', {
        templateUrl: 'templates/alluserslist.html',
        controller: 'AllUsersListCtrl',
        resolve: {isAuth}
    });
});

app.config(['ngToastProvider', (ngToast) => {
    ngToast.configure({
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      maxNumber: 1
    });
}]);

// Start Firebase Credentials
app.run(($location, FBCreds) => {
    let creds = FBCreds;
    let authConfig = {
        apiKey: creds.apiKey,
        authDomain: creds.authDomain,
        databaseURL: creds.databaseURL,
        storageBucket: creds.storageBucket,
        messageSenderId: creds.messageSenderId
    };
    firebase.initializeApp(authConfig);
});
