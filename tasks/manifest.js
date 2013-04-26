/*
 * assemble-manifest
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


  grunt.registerMultiTask('manifest', 'Generates JSON or YAML manifests from given src files.', function() {

    grunt.verbose.writeln(util.inspect(this.files, 10, null));

    // readOptionalJSON by Ben Alman https://gist.github.com/2876125
    function readOptionalJSON(filepath) {
      var data = {};
      try {
        data = grunt.file.readJSON(filepath);
        grunt.verbose.write("Reading " + filepath + "...").ok();
      } catch (e) {}
      return data;
    } 
    var pkg = readOptionalJSON('package.json');


    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      debug: false,
      indent: 2,
      sorted: false,
      output: 'json',
      name: pkg.name,
      description: pkg.description,
      version: pkg.version,
      repo: 'assemble/assemble',
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      peerDependencies: pkg.peerDependencies,
      optionalDependencies: pkg.optionalDependencies
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
        documents: [],
        fonts: [],
        images: [],
        scripts: [],
        styles: [],
        templates: [],
        files: []
      };

      fp.src.forEach(function (src) {
        grunt.verbose.writeln(src);

        var ext = path.extname(src);
        grunt.verbose.writeln(ext);

        switch (ext) {
          case ".md":
          case ".txt":
          case ".html":
          case ".htm":
          case ".doc":
          case ".docx":
          case ".pdf":
            grunt.verbose.writeln('Adding to documents'.gray);
            addFileToCollection(collections.documents, src);
            break;
          case ".eot":
          case ".svg":
          case ".ttf":
          case ".woff":
            grunt.verbose.writeln('Adding to fonts'.gray);
            addFileToCollection(collections.fonts, src);
            break;
          case ".ico":
          case ".png":
          case ".gif":
          case ".jpg":
            grunt.verbose.writeln('Adding to images'.green);
            addFileToCollection(collections.images, src);
            break;
          case ".js":
          case ".coffee": 
            grunt.verbose.writeln('Adding to scripts'.yellow);
            addFileToCollection(collections.scripts, src);
            break;
          case ".css":
          case ".less":
          case ".stylus":
          case ".sass":
          case ".scss":
            grunt.verbose.writeln('Adding to styles'.magenta);
            addFileToCollection(collections.styles, src);
            break;
          case ".hbs":
          case ".hbr":
          case ".handlebars":
          case ".mustache":
          case ".tmpl":
            grunt.verbose.writeln('Adding to templates'.gray);
            addFileToCollection(collections.templates, src);
            break;
          default:
            break;
        }
        addFileToCollection(collections.main, src);
      });

      options.main      = _.union(collections.main, originalCollections.main);
      options.styles    = _.union(collections.styles, originalCollections.styles);
      options.scripts   = _.union(collections.scripts, originalCollections.scripts);
      options.templates = _.union(collections.templates, originalCollections.templates);
      options.images    = _.union(collections.images, originalCollections.images);
      options.fonts     = _.union(collections.fonts, originalCollections.fonts);
      options.files     = _.union(collections.files, originalCollections.files);

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
      var optionsOutput = ((options.output).toLowerCase());
      var stringifyFile;
      if (optionsOutput === 'yaml' || optionsOutput === 'yml') {
        stringifyFile = YAML.stringify;
      } else {
        stringifyFile = JSON.stringify;
      }
      
      // Create JSON files.
      var addCollection = stringifyFile(optionalOptions, null, options.indent);
      grunt.file.write(dest, addCollection);
      grunt.log.write('Manifest "' + dest + '" created...'); grunt.log.ok();
    });

    function addFileToCollection(collection, file) {
      collection.push(file);
    }

    done();
  });
};

