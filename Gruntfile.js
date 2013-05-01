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
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Configuration to be run (and then tested).
    manifest: {
      options: {
        metadata: ['package.json']
      },
      debug: {
        options: { 
          debug: true,
          name: 'Debug Example',
          description: 'Debug shows all omitted objects and properties in the output.'
        },
        files: {
          'test/actual/debug.json': ['none/*.none']
        }
      },
      exclude: {
        options: { 
          name: 'Exclude Example',
          description: 'The exclude option allows you to omit properties that you do not want in the dest files.',
          metadata: ['package.json'], 
          exclude: [
            '*'
          ]
        },
        files: {
          'test/actual/exclude.json': ['none/*.none']
        }
      },
      metadata: {
        options: { 
          name: 'External Metadata Source Example',
          version: '0.1.0',
          metadata: ['package.json'], 
          description: 'The metadata option allows you specify an external source to supply metadata to your dest file(s).'
        },
        files: {
          'test/actual/metadata.json': ['none/*.none']
        }
      },
      component: {
        options: { 
          name: 'Component Manifest',
          description: 'Generate a component.json file.'
        },
        files: {
          'test/actual/component.json': ['none/*.none']
        }
      },
      collections: {
        options: { 
          name: 'Collections Example',
          collections: true,
          description: 'Generated a manifest from "collections" of files'
        },
        files: {
          'test/actual/collections.json': ['test/**/*.*']
        }
      },
      indentation: {
        options: { 
          name: 'Indentation Example',
          indent: 6,
          description: 'Customize the indentation of the output. Only works for JSON'
        },
        files: {
          'test/actual/indentation.json': ['test/**/*.*']
        }
      },
      custom_properties: {
        options: {
          custom: 'Any custom properties will be written to the dest file(s) in the target or task.',
          another: {
            custom: 'Example'
          }
        },
        files: {
          'test/actual/custom-properties.json': ['test/**/*.*']
        }
      },
      yaml: {
        options: {
          name: 'YAML Manifest Example',
          format: 'yml'
        },
        files: {
          'test/actual/manifest.yml': ['test/**/*.*']
        }
      },
      sorted: {
        options: { 
          name: 'Alphabetically Sorted Example',
          sorted: true
        },
        files: {
          'test/actual/sorted.json': ['test/fixtures/bootstrap/**/*.*']
        }
      },
      images: {
        options: {
          name: 'Images Manifest Example'
        },
        files: {
          'test/actual/images.json': ['test/fixtures/*.{jpg,png,gif}'],
        }
      },
      images_main_only: {
        options: {
          exclude: ['images', 'dependencies'],
          name: 'Images Manifest'
        },
        files: {
          'test/actual/images-main.json': ['test/fixtures/*.{jpg,png,gif}'],
        }
      },
      cccc: {
        options: {
          manifestrc: '.manifestrc',  // Optional external config options.
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
            'test/fixtures/bootstrap/less/*.less',
            'test/fixtures/bootstrap/docs/assets/**/*.*'
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
            'test/fixtures/bootstrap/less/*.less',
            'test/fixtures/bootstrap/docs/assets/**/*.js',
            'test/fixtures/bootstrap/docs/assets/fonts/*.*'
          ]
        }
      },
      lib: {
        options: {
          name: 'Bootstrap LESS',
          exclude: 'main'
        },
        files: {
          'test/actual/less.json': ['test/fixtures/bootstrap/**/*.{less,js}']
        }
      },
      theme: {
        options: {
          name: 'Theme Manifest'
        },
        files: {
          'test/actual/theme-css.json': ['test/fixtures/*.css'],
          'test/actual/theme-js.json': ['test/fixtures/*.js']
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
  grunt.registerTask('test', ['default']); // 'nodeunit'

};
