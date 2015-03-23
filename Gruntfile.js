/**
 * Created by duran on 3/16/2015.
 */
/*
 * grunt-contrib-concat
 * http://gruntjs.com/
 *
 * Copyright (c) 2015 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var mozjpeg = require('imagemin-mozjpeg');

module.exports = function(grunt) {

  var path = require('path');

  // Project configuration.
  grunt.initConfig({
    imagemin: {

        static: {// Task
            options: {                       // Target options
                optimizationLevel: 7,
                use: [mozjpeg()]
            },
            files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'img_orig/',                   // Src matches are relative to this path
                    src: ['*.{png,jpg,gif}'],   // Actual patterns to match
                    dest: 'img/'                  // Destination path prefix
                }
                ]
        },
        static_pizza: {// Task
                options: {                       // Target options
                optimizationLevel: 7,
                use: [mozjpeg()]
            },
                files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'views_orig/images/',                   // Src matches are relative to this path
                    src: ['*.{png,jpg,gif}'],   // Actual patterns to match
                    dest: 'views/images/'                  // Destination path prefix
                }
                ]
            }
    },
      uglify: {
        basic: {
          files: {'js/perfmatters.js': ['js_orig/perfmatters.js']}

        },
        extras: {
            files: {'views/js/main.js': ['views_orig/js/main.js']}
        }
      },
      htmlmin: {
          main: {
              options: {                                 // Target options
                  removeComments: true,
                  collapseWhitespace: true
              },
              files: {                                   // Dictionary of files
                  'index.html': 'index_orig.html'     // 'destination': 'source'
              }
          },
          views: {
              options: {                                 // Target options
                  removeComments: true,
                  collapseWhitespace: true
              },
              files: {                                   // Dictionary of files
                  'views/pizza.html': 'views_orig/pizza.html'     // 'destination': 'source'
              }
          }
      },

    // Before generating any new files, remove any previously-created files.
    clean: {
        tests: ['tmp']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['imagemin', 'uglify', 'htmlmin']);

};
