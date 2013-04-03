/*
 * grunt-json-manifest
 * https://github.com/jps/New folder
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Configuration to be run (and then tested).
    manifest: {
      component: {
        options: {
          name: 'test-name',
          version: '1.3.4'
        },
        files: {
          'test/actual/component.json': ['test/fixtures']
        }
      }
    },


  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['manifest']);

};
