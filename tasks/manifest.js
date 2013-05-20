/*
 * assemble-manifest
 * https://github.com/assemble/assemble-manifest
 *
 * Copyright (c) 2013 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  // External libs.
  var fs   = require('graceful-fs');
  var path = require('path');
  var util = require('util');
  var to   = require('to');
  var _    = grunt.util._; // lodash

  // Internal lib
  _.mixin(require('./lib/mixins').init(grunt));

  grunt.registerMultiTask('manifest', 'Generates JSON or YAML manifests from given src files.', function() {
    var done = this.async();

    var pkg = _('./package.json').readOptionalJSON();

    // Default configuration options.
    var options = this.options({
      // Misc
      manifestrc: [],
      debug: false,
      
      // Formatting
      format: 'json',
      sorted: false,
      indent: 2,

      // Metadata
      metadata: [],
      exclude: [],
      include: [],

      // Defaults
      name: pkg.name,
      description: pkg.description,
      version: pkg.version,
      repo: 'assemble/assemble',
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      peerDependencies: pkg.peerDependencies,
      optionalDependencies: pkg.optionalDependencies
    });

    /**
     * Default objects and properties excluded from output.
     * When debug is set to "true" these are shown.
     */
    var defaultOmissions = _.defaults([
      'collections',
      'debug',
      'exclude',
      'format',
      'include',
      'indent',
      'manifestrc',
      'metadata',
      'sorted'
    ]);

    // Supply metadata from files specified.
    _(options).merge(_.readOptionalJSON(options.metadata));

    // Use .manifestrc file if one has been specified.
    _(options).merge(_.readOptionalJSON(options.manifestrc));

    // Optional array of objs/props to exclude from output.
    options.exclude = _.mergeOptionsArrays(this.target, 'exclude');
    options.include = _.mergeOptionsArrays(this.target, 'include');


    // Default "collections"
    var defaultCollections = {
      main: _.union(options.main || [], [])
    };

    // Collection "defaults"
    // _(options).merge({collections: {styles: ['css', 'less', 'stylus', 'sass', 'scss'] } });

    // build collection extension map
    var extCollectionMap = {};
    if(options.collections) {
      _.forOwn(options.collections, function(value, key) {
        if(!Array.isArray(value)) {
          value = [value];
        }
        _.each(value, function(ext) {
          if(ext.indexOf('.') !== 0) {
            ext = '.' + ext;
          }
          if(!extCollectionMap[ext]) {
            extCollectionMap[ext] = [];
          }
          extCollectionMap[ext].push(key);
        });

        // add collection to defaultCollections
        if(!defaultCollections[key]) {
          defaultCollections[key] = _.union(options[key] || [], []);
        }
      });
    }

    this.files.forEach(function(fp) {
      var dest = fp.dest;
      var collections = {};
      _.forOwn(defaultCollections, function(value, key) {
        collections[key] = [];
      });

      if (options.collections !== false) {
        fp.src.forEach(function (src) {
          var ext = path.extname(src);

          function switchCollection(type, callback) {
            grunt.verbose.writeln('Adding ' + path.basename(src).red + ' to ' + collections[type].red + ' collection');
            return addFileToCollection(collections[type], src);
          }

          /**
           * TODO: refactor to include default collections and
           * extensions, but also allow options to extend/override
           * with custom collections and extensions.
           */
          _.each(extCollectionMap[ext], function(colName) {
            switchCollection(colName);
          });

          addFileToCollection(collections.main, src);
        });

        _.forOwn(collections, function(value, key) {
          options[key] = _.union(collections[key], defaultCollections[key]);
        });
      }
      // grunt.verbose.writeln(util.inspect(this.files, 10, null));

      /**
       * options.debug
       * Default: 'false'
       * Shows all properies and objects in generated files,
       * including those "excluded" by default or in the task
       */
      var optionalOptions;
      var filteredOptions = _.omit(options, options.exclude, defaultOmissions);
      if (options.debug === true) {
        optionalOptions = options;
      } else {
        optionalOptions = filteredOptions;
      }

      /**
       * Sorted: boolean. Sort objects and properties alphabetically
       * Default: false
       */
      var finalOptions = options.sorted ? _(optionalOptions).sortObject() : optionalOptions;

      /**
       * Format: Generate files in either JSON or YAML format
       * Default: 'json'
       */
      var stringifyFile = function(opts, n, indent) {
        var YAML = to.format.yaml;
        var outputFormat = ((options.format).toLowerCase());
        if (outputFormat === 'yaml' || outputFormat === 'yml') {
          stringifyFile = YAML.stringify(opts, n, indent);
        } else {
          stringifyFile = JSON.stringify(opts, n, indent);
        }
        return stringifyFile;
      };

      /**
       * Generate files
       */
      var addCollection = stringifyFile(finalOptions, null, options.indent);
      grunt.file.write(dest, addCollection);
      
      grunt.log.write('Creating "' + dest.magenta + '"...'); grunt.log.ok();
    });

    // Print a success message.
    done();
  }); // end of task


  var addFileToCollection = function(collection, file) {
    collection.push(file);
  };
};
