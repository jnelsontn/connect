module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        predef: [ "document", "console", "$", "$scope", "firebase", "FileReader" ],
        esnext: true,
        globalstrict: true,
        globals: {"firebase" : true, "angular": true, "app": true}
      },
      files: ['../app/**/*.js']
    },
    copy: { //for bootstrap and jquery - only need to do the first time.
      bootstrap: {
        expand: true,
        cwd: 'node_modules/bootstrap/dist/css',
        src: ['bootstrap.min.css'],
        dest: '../dist'
    },
    jquery: {
        expand: true,
        cwd: 'node_modules/jquery/dist',
        src: ['jquery.min.js'],
        dest: '../dist'
    },
    angular: {
        expand: true,
        cwd: 'node_modules/angular',
        src: ['angular.min.js'],
        dest: '../dist'
    }, 
    angularfire: {
        expand: true,
        cwd: 'node_modules/angularfire/dist',
        src: ['angularfire.min.js'],
        dest: '../dist'
    },
    angularroute: {
        expand: true,
        cwd: 'node_modules/angular-route',
        src: ['angular-route.min.js'],
        dest: '../dist'
    },
    firebase: {
        expand: true,
        cwd: 'node_modules/firebase/',
        src: ['firebase.js'],
        dest: '../dist'
    }
    },
    sass: {
      dist: {
        files: {
          '../css/main.css': '../sass/main.scss'
        }
      }
    },
    watch: {
      javascripts: {
        files: ['../app/**/*.js'],
        tasks: ['jshint']
      },
      sass: {
        files: ['../sass/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['copy', 'jshint', 'sass', 'watch']);
};
