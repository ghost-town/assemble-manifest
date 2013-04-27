/*
 * assemble-manifest
 * https://github.com/jps/New folder
 *
 * Copyright (c) 2013 Jon Schlinkert
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
        debug: true,
        version: '1.7.5',
        dependencies: {
          'amdefine': '0.0.4',
          'chai': '~1.5.0',
          'grunt': '~0.4.0',
          'grunt-contrib-jshint': '~0.1.0',
          'grunt-contrib-watch': '~0.2.0',
          'grunt-mocha-test': '~0.2.0',
          'grunt-release': '~0.2.0',
          'handlebars': '~1.0.9',
          'testem': '~0.2.68'
        },
        omit: ['devDependencies', 'dependencies'],
        indent: 2,
        sorted: false,
        output: 'json'
      },
      component: {
        options: { 
          omit: ['styles', 'scripts', 'fonts', 'files'],
          name: 'Component Manifest' 
        },
        files: {
          'test/actual/component.json': ['tasks/*.*']
        }
      },
      images: {
        options: {
          omit: ['images', 'dependencies'],
          name: 'Images Manifest'
        },
        files: {
          'test/actual/image-files.json': ['test/fixtures/*.{jpg,png,gif}'],
        }
      },
      yaml: {
        options: {
          name: 'YAML Manifest',
          output: 'yml',
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
      main: {
        options: {
          name: 'Main Files'
        },
        files: {
          'test/actual/files5.json': ['test/main/*.*']
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
