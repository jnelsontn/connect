module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        predef: [ 'document', 'console', 'window', '$scope', 'firebase' ],
        esnext: true,
        globalstrict: true,
        globals: {'firebase' : true, 'angular': true, 'app': true}
      },
      files: ['../app/**/*.js']
    },
    copy: {
        angular: {
            expand: true,
            cwd: 'node_modules/angular',
            src: ['angular.min.js', 'angular.min.js.map'],
            dest: '../dist/js'
        },
        angularsanitize: {
            expand: true,
            cwd: 'node_modules/angular-sanitize',
            src: ['angular-sanitize.min.js', 'angular-sanitize.min.js.map'],
            dest: '../dist/js'
        },
        angularfire: {
            expand: true,
            cwd: 'node_modules/angularfire/dist',
            src: ['angularfire.min.js'],
            dest: '../dist/js'
        },
        angularroute: {
            expand: true,
            cwd: 'node_modules/angular-route',
            src: ['angular-route.min.js', 'angular-route.min.js.map'],
            dest: '../dist/js'
        },
        bootstrap: {
            expand: true,
            cwd: 'node_modules/bootstrap/dist/css',
            src: ['bootstrap.min.css', 'bootstrap.min.css.map'],
            dest: '../dist/css'
        },
        firebase: {
            expand: true,
            cwd: 'node_modules/firebase/',
            src: ['firebase.js'],
            dest: '../dist/js'
        },
        ngtoast: {
            expand: true,
            cwd: 'node_modules/ng-toast/dist',
            src: ['ngToast.min.css'],
            dest: '../dist/css'
        },
        ngtoastjs: {
            expand: true,
            cwd: 'node_modules/ng-toast/dist',
            src: ['ngToast.min.js'],
            dest: '../dist/js'
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
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['copy', 'jshint', 'watch']);
};
