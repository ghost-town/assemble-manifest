/*
 * assemble-manifest
 * https://github.com/assemble/assemble-manifest
 *
 * Copyright (c) 2013 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {


  var fs   = require('fs');
  var path = require('path');
  var util = require('util');
  var to   = require('to');
  var _    = grunt.util._;


  grunt.registerMultiTask('manifest', 'Generates JSON or YAML manifests from given src files.', function() {
    grunt.verbose.writeln(util.inspect(this.files, 10, null));

    var pkg = readOptionalJSON('../package.json');

    /* Merge task-specific and/or target-specific 
     * options with these defaults, this is a temporary quick-fix.
     */
    var options = this.options({
      /* Default metadata */
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

      /* Config options */
      indent: 2,
      format: 'json',
      sorted: false,
      debug: false
    });


    /* Extend default options with options 
     * from specified manifestrc file 
     */
    if (options.manifestrc) {
      options = grunt.util._.extend(options, grunt.file.readJSON(options.manifestrc));
    }

    options.exclude = mergeOptionsArrays(this.target, 'exclude');



    /* COLLECTIONS
     * =========== */

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
    this.files.forEach(function(fp) {
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

        /* 
         * TODO: refactor to include default collections and
         * extensions, but also allow options to extend/override
         * with custom collections and extensions. 
         */ 
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


      /* CONFIG OPTIONS
       * ==============

      /* Default objects and properties excluded from output. 
       * When debug is set to "true" these are shown.
       */
      var defaultOmissions = _.defaults([
        'debug',
        'exclude',
        'indent',
        'metadata',
        'format',
        'sorted'
      ]);

      /* options.debug
       *
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

      var YAML = to.format.yaml;

      /* options.format
       *
       * Default: 'json'
       * Generate files in either JSON or YAML format
       */
      var outputFormat = ((options.format).toLowerCase());
      var stringifyFile;
      if (outputFormat === 'yaml' || outputFormat === 'yml') {
        stringifyFile = YAML.stringify;
      } else {
        stringifyFile = JSON.stringify;
      }

      /* options.sorted
       *
       * Default: false
       * Sort objects and properties alphabetically
       */
      var sortedOptions = sortObject(options);
      if (options.sorted === true) {
        options = sortedOptions;
      } else {
        options = options;
      }



      // Create JSON files.
      // var addCollection = stringifyFile(optionalOptions, excludedKeys, options.indent);
      var addCollection = stringifyFile(optionalOptions, null, options.indent);
      grunt.file.write(dest, addCollection);
      grunt.log.write('Manifest "' + dest + '" created...'); grunt.log.ok();
    });


    done();
  }); // end of task


  /* UTILITY FUNCTIONS
   * ================= */

  /* readOptionalJSON 
   * Credit: Ben Alman, https://gist.github.com/2876125
   */
  var readOptionalJSON = function(filepath) {
    var data = {};
    try {
      data = grunt.file.readJSON(filepath);
      grunt.verbose.write("Reading " + filepath + "...").ok();
    } catch (e) {}
    return data;
  };
  var readOptionalYAML = function(filepath) {
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

  /* function pulled from assemble */
  /* https://github.com/assemble/assemble */
  var mergeOptionsArrays = function(target, name) {
    var globalArray = grunt.config(['manifest', 'options', name]) || [];
    var targetArray = grunt.config(['manifest', target, 'options', name]) || [];
    return _.union(globalArray, targetArray);
  };

};

