/*
 * grunt-json-manifest
 * https://github.com/jps/New folder
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  var fs   = require('fs');
  var path = require('path');
  var util = require('util');
  var _    = require('lodash');
  var YAML = require('json2yaml');

  grunt.registerMultiTask('manifest', 'Generates JSON manifests from given src files.', function() {
    grunt.verbose.ok(util.inspect(this.files, 10, null));

    var pkg = grunt.file.readJSON('package.json');

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      indent: 2,
      sorted: false,
      kind: 'JSON',
      name: pkg.name,
      description: pkg.description,
      version: pkg.version,
      repo: 'assemble/assemble',
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      peerDependencies: pkg.peerDependencies
    });

    var originalCollections = {
      main: _.union(options.main || [], []),
      styles: _.union(options.styles || [], []),
      scripts: _.union(options.scripts || [], []),
      templates: _.union(options.templates || [], []),
      images: _.union(options.images || [], []),
      fonts: _.union(options.fonts || [], []),
      files: _.union(options.files || [], [])
    };
    var done = this.async();
    grunt.verbose.writeflags(options, 'Options');

    this.files.forEach(function(fp) {
      grunt.verbose.writeln(util.inspect(fp, 10, null));

      var dest = fp.dest;
      var collections = {
        main: [],
        styles: [],
        scripts: [],
        templates: [],
        images: [],
        fonts: [],
        files: []
      };

      fp.src.forEach(function(src) {

        // Verify that files exist. Warn if a source file/pattern was invalid.
        if (!grunt.file.exists(src)) {
          grunt.log.warn('Source file "' + src + '" not found.');
          return false;
        } else {
          return true;
        }
        grunt.verbose.writeln(src);

        var ext = path.extname(src);
        grunt.verbose.writeln(ext);

        switch (ext) {
          case ".css":
          case ".less":
          case ".stylus":
          case ".sass":
          case ".scss":
            grunt.verbose.writeln('Adding to styles'.magenta);
            addFileToCollection(collections.styles, src);
            break;
          case ".js":
          case ".coffee":
            grunt.verbose.writeln('Adding to scripts'.yellow);
            addFileToCollection(collections.scripts, src);
            break;
          case ".eot":
          case ".ttf":
          case ".woff":
            grunt.verbose.writeln('Adding to fonts'.gray);
            addFileToCollection(collections.fonts, src);
            break;
          case ".img":
          case ".png":
          case ".gif":
          case ".jpg":
            grunt.verbose.writeln('Adding to images'.green);
            addFileToCollection(collections.images, src);
            break;
          default:
            break;
        }
        addFileToCollection(collections.main, src);
      });


      // Credit: https://github.com/mirkokiefer/canonical-json
      var copyObjectWithSortedKeys = function(object) {
        if (isObject(object)) {
          var newObj = {};
          var keysSorted = Object.keys(object).sort();
          var key;
          for (var i in keysSorted) {
            key = keysSorted[i];
            if (Object.prototype.hasOwnProperty.call(object, key)) {
              newObj[key] = copyObjectWithSortedKeys(object[key]);
            }
          }
          return newObj;
        } else if (isArray(object)) {
          return object.map(copyObjectWithSortedKeys);
        } else {
          return object;
        }
      };
      var isObject = function(a) {
        return Object.prototype.toString.call(a) === '[object Object]';
      };
      var isArray = function(a) {
        return Object.prototype.toString.call(a) === '[object Array]';
      };

      options.main = _.union(collections.main, originalCollections.main);
      options.styles = _.union(collections.styles, originalCollections.styles);
      options.scripts = _.union(collections.scripts, originalCollections.scripts);
      options.templates = _.union(collections.templates, originalCollections.templates);
      options.images = _.union(collections.images, originalCollections.images);
      options.fonts = _.union(collections.fonts, originalCollections.fonts);
      options.files = _.union(collections.files, originalCollections.files);


      // Remove specified keys from object
      function removeKeys(obj, keys) {
        var copyOpts = {};
        for (var key in obj) {
          if (keys.indexOf(key) === -1) {
            copyOpts[key] = obj[key];
          }
        }
        return copyOpts;
      }

      // Remove properties that only belong in config.
      var filteredOptions = removeKeys(options, ['indent', 'sorted', 'debug']);

      var optionalOptions;
      if (options.debug === true) {
        optionalOptions = options;
      } else {
        optionalOptions = filteredOptions;
      }

      // Sort JSON alphabetically
      if (options.sorted === true) {
        optionalOptions = copyObjectWithSortedKeys(optionalOptions);
      } else {
        optionalOptions = optionalOptions;
      }


      // Option to create JSON or YAML.
      var optionsKind = ((options.kind).toLowerCase());
      var stringifyFile;
      if (optionsKind === 'yaml' || optionsKind === 'yml') {
        stringifyFile = YAML.stringify;
      } else {
        stringifyFile = JSON.stringify;
      }

      // Create JSON files.
      var addCollection = stringifyFile(optionalOptions, null, options.indent);
      grunt.log.write('Manifest "' + dest + '" created...'); grunt.log.ok();
      grunt.file.write(dest, addCollection);
    });

    function addFileToCollection(collection, file) {
      collection.push(file);
    }

    done();
  });
};