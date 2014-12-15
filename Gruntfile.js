'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        watch: {
            scripts: {
                files: ['lib/**/*.js', 'test/**/*.js', 'server.js'],
                tasks: ['buster:test'],
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            files: ['lib/**/*.js', 'test/**/*.js', 'Gruntfile.js', 'server.js']
        },
        concurrent: {
            dev: {
                tasks: ['nodemon:dev', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                ignore: ['node_modules/**']
            }
        },
        buster: {
            test: { }
        }
    });

    grunt.registerTask('dev', ['jshint', 'buster:test', 'concurrent:dev']);
    grunt.registerTask('test', ['buster:test']);
    grunt.registerTask('default', ['dev']);
};
