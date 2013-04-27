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
  var _    = grunt.util._;
  var YAML = require('json2yaml');


  grunt.registerMultiTask('manifest', 'Generates JSON or YAML manifests from given src files.', function() {

    grunt.verbose.writeln(util.inspect(this.files, 10, null));

    var pkg = readOptionalJSON('package.json');

    // Merge task-specific and/or target-specific options with these defaults.
    // this is a temporary quick-fix.
    var options = this.options({
      name                : pkg.name,
      description         : pkg.description,
      version             : pkg.version,
      repository          : pkg.repository,
      dependencies        : pkg.dependencies,
      devDependencies     : pkg.devDependencies,
      peerDependencies    : pkg.peerDependencies,
      optionalDependencies: pkg.optionalDependencies,
      author              : pkg.author,
      contributors        : pkg.contributors,
      keywords            : pkg.keywords,
      homepage            : pkg.homepage,
      licenses            : pkg.licenses,
      engines             : pkg.engines,

      // Task config options
      debug: false,
      indent: 2,
      sorted: false,
      output: 'json',
    });

    // Extend default options with options from specified manifestrc file
    if (options.manifestrc) {
      options = grunt.util._.extend(options, grunt.file.readJSON(options.manifestrc));
    }

    options.exclude = mergeOptionsArrays(this.target, 'exclude');

    var originalCollections = {
      main       : _.union(options.main || [], []),
      documents  : _.union(options.documents || [], []),
      markdown   : _.union(options.markdown || [], []),
      styles     : _.union(options.styles || [], []),
      javascripts: _.union(options.javascripts || [], []),
      templates  : _.union(options.templates || [], []),
      images     : _.union(options.images || [], []),
      fonts      : _.union(options.fonts || [], []),
      files      : _.union(options.files || [], [])
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
        javascripts: [],
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
          case ".doc":
          case ".docx":
          case ".pdf":
            grunt.verbose.writeln('Adding to documents collection'.gray);
            addFileToCollection(collections.documents, src);
            break;
          case ".eot":
          case ".svg":
          case ".otf":
          case ".ttf":
          case ".woff":
            grunt.verbose.writeln('Adding to fonts collection'.gray);
            addFileToCollection(collections.fonts, src);
            break;
          case ".ico":
          case ".png":
          case ".gif":
          case ".jpg":
            grunt.verbose.writeln('Adding to images collection'.green);
            addFileToCollection(collections.images, src);
            break;
          case ".js":
          case ".coffee":
            grunt.verbose.writeln('Adding to javascripts collection'.yellow);
            addFileToCollection(collections.javascripts, src);
            break;
          case ".md":
          case ".markd":
          case ".markdown":
            grunt.verbose.writeln('Adding to markdown collection'.yellow);
            addFileToCollection(collections.markdown, src);
            break;
          case ".css":
          case ".less":
          case ".stylus":
          case ".sass":
          case ".scss":
            grunt.verbose.writeln('Adding to styles collection'.magenta);
            addFileToCollection(collections.styles, src);
            break;
          case ".hbs":
          case ".hbr":
          case ".handlebars":
          case ".html":
          case ".htm":
          case ".mustache":
          case ".tmpl":
            grunt.verbose.writeln('Adding to templates collection'.gray);
            addFileToCollection(collections.templates, src);
            break;
          default:
            break;
        }
        addFileToCollection(collections.main, src);
      });

      options.main        = _.union(collections.main, originalCollections.main);
      options.styles      = _.union(collections.styles, originalCollections.styles);
      options.javascripts = _.union(collections.javascripts, originalCollections.javascripts);
      options.templates   = _.union(collections.templates, originalCollections.templates);
      options.images      = _.union(collections.images, originalCollections.images);
      options.fonts       = _.union(collections.fonts, originalCollections.fonts);
      options.files       = _.union(collections.files, originalCollections.files);

      // Properties that are excluded from output by default,
      // unless debug is set to "true"
      var defaultOmissions = _.defaults([
        'debug',
        'exclude',
        'indent',
        'metadata',
        'output',
        'sorted'
      ]);
      var filteredOptions = _.omit(options, options.exclude, defaultOmissions);
      var optionalOptions;
      if (options.debug === true) {
        optionalOptions = options;
      } else {
        optionalOptions = filteredOptions;
      }

      // Sort JSON alphabetically
      if (options.sorted === true) {
        optionalOptions = sortObject(optionalOptions);
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


    done();
  }); // end of task

  // utility functions

  // readOptionalJSON by Ben Alman https://gist.github.com/2876125
  var readOptionalJSON = function(filepath) {
    var data = {};
    try {
      data = grunt.file.readJSON(filepath);
      grunt.verbose.write("Reading " + filepath + "...").ok();
    } catch (e) {}
    return data;
  };


  var addFileToCollection = function(collection, file) {
    collection.push(file);
  };


  var sortObject = function(o) {
    var sorted = {},
    key, a = [];
    for (key in o) {
      if (o.hasOwnProperty(key)) {
        a.push(key);
      }
    }
    a.sort();
    for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
    }
    return sorted;
  };

  // function pulled from assemble
  // https://github.com/assemble/assemble
  var mergeOptionsArrays = function(target, name) {
    var globalArray = grunt.config(['manifest', 'options', name]) || [];
    var targetArray = grunt.config(['manifest', target, 'options', name]) || [];
    return _.union(globalArray, targetArray);
  };

};

