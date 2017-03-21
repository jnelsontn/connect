module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        predef: [ 'document', 'console', 'window', '$', '$scope', 'firebase', 'FileReader' ],
        esnext: true,
        globalstrict: true,
        globals: {'firebase' : true, 'angular': true, 'app': true}
      },
      files: ['../app/**/*.js']
    },
    copy: {
        bootstrap: {
            expand: true,
            cwd: 'node_modules/bootstrap/dist/css',
            src: ['bootstrap.min.css', 'bootstrap.min.css.map'],
            dest: '../dist/css'
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
        },
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
        firebase: {
            expand: true,
            cwd: 'node_modules/firebase/',
            src: ['firebase.js'],
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
