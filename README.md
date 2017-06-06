Connect - Social Network | [LIVE DEMO https://connect.digitalmarshmellow.com](http://connect.digitalmarshmellow.com)
* * *

**ABOUT:**

Connect is an alternative to large social networks and allows users to create a profile, find connections, upload and share photos and send real-time messages.

**USAGE:**

To sign-in a Google account is required.
Once signed in, a user can create their profile and find connections. Once a connection has been created, users can send real-time messages and share photos.


**INSTALLATION:**

Clone down the Connect repository:
```git clone https://github.com/jnelsontn/jnelsontn.github.io.git```

Connect includes all dependencies; however, a Firebase database is required for the backend service.
Once a database is created, edit [app/values/fb-creds.js](app/values/fb-creds.js) and provide the appropriate credentials within the quotations.

    app.constant('FBCreds', {
        apiKey: 'api-key-here',
        authDomain: 'auth-domain-here',
        databaseURL: 'database-url-here'
        storageBucket: 'storage-bucket-id-here'
    });

Once you have entered in your Firebase credentials, all that is left is to use initialize a http server (NodeJS http-server, nginx, etc.) of your choice.

If you would like to update dependencies, a Gruntfile.js and package.json are included in the lib/ directory.

**SCREENSHOTS**

Screenshots displaying Connect's functionality.

1. [User Profile View](screenshots/profileview.png)
2. [Photo Album and Real Time Notifications](screenshots/photos-and-notification-of-request.png)
3. [Connection/Friend Profile](screenshots/connected-profile.png)
4. [Connections/Friends List](screenshots/connected-list.png)
5. [Request Connection/Other User has not confirmed](screenshots/connection-requested.png)

**TECHNOLOGIES**

Front-End: AngularJS/Firebase JS Library | 
Back-End: Firebase Database



