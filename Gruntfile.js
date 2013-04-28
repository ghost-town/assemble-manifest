/*
 * assemble-manifest
 * https://github.com/assemble/assemble-manifest
 *
 * Copyright (c) 2013 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
        // '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Configuration to be run (and then tested).
    manifest: {
      options: {
        manifestrc: '.manifestrc', // Optional external options and metadata.
        indent: 2,
        debug: true,
        sorted: true,
        exclude: [
          'devDependencies',
          'dependencies'
        ]
      },
      // Generate a component.json file.
      component: {
        options: { 
          name: 'Component Manifest' 
        },
        // dest: 'test/actual/component.json'
        files: {
          'test/actual/component.json': ['none/*.none']
        }
      },
      images: {
        options: {
          name: 'Images Manifest'
        },
        files: {
          'test/actual/images.json': ['test/fixtures/**/*.{jpg,png,gif}'],
        }
      },
      images_main_only: {
        options: {
          exclude: ['images', 'dependencies'],
          name: 'Images Manifest'
        },
        files: {
          'test/actual/images-main.json': ['test/fixtures/**/*.{jpg,png,gif}'],
        }
      },
      yaml: {
        options: {
          name: 'YAML Manifest',
          format: 'yml',
          styles: [
            "upstage.css"
          ],
          scripts: ['scripts.js'],
          images: ['styles.css'],
          fonts: ['font.woff'],
          files: ['presentation.pdf']
        },
        files: {
          'test/actual/any-files1.yml': ['test/fixtures/*.*'],
          'test/actual/any-files2.yml': ['test/**/*.*']
        }
      },
      bootstrap: {
        options: {
          name: 'Bootstrap Manifest'
        },
        files: {
          'test/actual/bootstrap.json': [
            'test/bootstrap/less/*.less',
            'test/bootstrap/docs/assets/**/*.*'
          ]
        }
      },
      bootstrap_yaml: {
        options: {
          name: 'Bootstrap Manifest',
          format: 'yaml'
        },
        files: {
          'test/actual/bootstrap.yml': [
            'test/bootstrap/less/*.less',
            'test/bootstrap/docs/assets/**/*.js',
            'test/bootstrap/docs/assets/fonts/*.*'
          ]
        }
      },
      bootstrap_sorted: {
        options: {
          sorted: true,
          name: 'Bootstrap Manifest'
        },
        files: {
          'test/actual/bootstrap_sorted.json': [
            'test/bootstrap/less/*.less',
            'test/bootstrap/docs/assets/**/*.*'
          ]
        }
      },
      lib: {
        options: {
          name: 'Bootstrap LESS',
          exclude: 'main'
        },
        files: {
          'test/actual/less.json': ['test/bootstrap/**/*.{less,js}']
        }
      },
      theme: {
        options: {
          name: 'Theme Manifest'
        },
        files: {
          'test/actual/css-files.json': ['test/fixtures/*.css'],
          'test/actual/js-files.json': ['test/fixtures/*.js']
        }
      }
    },

    // Configuration to be run (and then tested).
    clean: {
      json: ['test/actual/*.{json,yml}']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'clean', 'manifest']);

  // By default, lint and run all tests.
  // grunt.registerTask('test', ['default', 'nodeunit']);

};
