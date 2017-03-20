'use strict';

var app = angular.module('Connect', ['ngRoute', 'firebase', 'ui.bootstrap']);

//used to authenticate user when navigating to other views
let isAuth = (AuthFactory) => new Promise ( (resolve, reject) => {
    AuthFactory.isAuthenticated().then ( (userExists) => {
        if (userExists){
            //console.log("Authenticated, go ahead.");
            resolve();
        } else {
            //console.log("Authentication rejected, go away.");
            reject();
        }
    });
});

app.config(function($routeProvider) {
    $routeProvider.
    when('/', {
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
        resolve: {isAuth}
    }).
    when('/profile/:profileId/images', {
        templateUrl: 'templates/images.html',
        controller: 'ImagesCtrl',
        resolve: {isAuth}
    }).
    when('/profile/:profileId/notifications', {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsCtrl',
        resolve: {isAuth}
    }).
    when('/allusers', {
        templateUrl: 'templates/alluserslist.html',
        controller: 'AllUsersListCtrl',
        resolve: {isAuth}
    });
});

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
