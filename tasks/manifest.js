/*
 * assemble-manifest
 * https://github.com/assemble/assemble-manifest
 *
 * Copyright (c) 2013 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {


  var fs   = require('graceful-fs');
  var path = require('path');
  var util = require('util');
  var to   = require('to');
  var _    = grunt.util._; // lodash


  grunt.registerMultiTask('manifest', 'Generates JSON or YAML manifests from given src files.', function() {

    var done = this.async();
    
    // Default configuration options.
    var options = this.options({
      collections: true,
      manifestrc: [],
      metadata: [],
      indent: 2,
      exclude: [],
      format: 'json',
      sorted: false,
      debug: false
    });

    // Supply metadata from files specified.
    _(options).merge(_.readOptionalJSON(options.metadata));

    // Use .manifestrc file if one has been specified.
    _(options).merge(_.readOptionalJSON(options.manifestrc));

    // Optional array of objs/props to exclude from output.
    options.exclude = _.mergeOptionsArrays(this.target, 'exclude');

    // Default "collections"
    var defaultCollections = {
      documents  : _.union(options.documents || [], []),
      fonts      : _.union(options.fonts || [], []),
      images     : _.union(options.images || [], []),
      javascripts: _.union(options.javascripts || [], []),
      main       : _.union(options.main || [], []),
      markdown   : _.union(options.markdown || [], []),
      styles     : _.union(options.styles || [], []),
      templates  : _.union(options.templates || [], [])
    };

    /* Default objects and properties excluded from output. 
     * When debug is set to "true" these are shown.
     */
    var defaultOmissions = _.defaults([
      'collections',
      'debug',
      'exclude',
      'format',
      'indent',
      'manifestrc',
      'metadata',
      'sorted'
    ]);

    this.files.forEach(function(fp) {
      var dest = fp.dest;
      var collections = {
        documents: [],
        fonts: [],
        images: [],
        javascripts: [],
        main: [],
        styles: [],
        templates: []
      };

      if (options.collections !== false) {
        fp.src.forEach(function (src) {
          var ext = path.extname(src);

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
              grunt.verbose.writeln('Adding ' + path.basename(src).gray + ' to documents collection');
              addFileToCollection(collections.documents, src);
              break;
            case ".eot":
            case ".svg":
            case ".otf":
            case ".ttf":
            case ".woff":
              grunt.verbose.writeln('Adding ' + path.basename(src).cyan + ' to fonts collection');
              addFileToCollection(collections.fonts, src);
              break;
            case ".ico":
            case ".png":
            case ".gif":
            case ".jpg":
              grunt.verbose.writeln('Adding ' + path.basename(src).magenta + ' to images collection');
              addFileToCollection(collections.images, src);
              break;
            case ".js":
            case ".coffee":
              grunt.verbose.writeln('Adding ' + path.basename(src).blue + ' to javascripts collection');
              addFileToCollection(collections.javascripts, src);
              break;
            case ".md":
            case ".markd":
            case ".markdown":
              grunt.verbose.writeln('Adding ' + path.basename(src).cyan + ' to markdown collection');
              addFileToCollection(collections.markdown, src);
              break;
            case ".css":
            case ".less":
            case ".stylus":
            case ".sass":
            case ".scss":
              grunt.verbose.writeln('Adding ' + path.basename(src).yellow + ' to styles collection');
              addFileToCollection(collections.styles, src);
              break;
            case ".hbs":
            case ".hbr":
            case ".handlebars":
            case ".html":
            case ".htm":
            case ".mustache":
            case ".tmpl":
              grunt.verbose.writeln('Adding ' + path.basename(src).green + ' to templates collection');
              addFileToCollection(collections.templates, src);
              break;
            default:
              break;
          }
          grunt.verbose.writeln(util.inspect(this.files, 10, null));
          addFileToCollection(collections.main, src);


        });

        options.main        = _.union(collections.main, defaultCollections.main);
        options.styles      = _.union(collections.styles, defaultCollections.styles);
        options.javascripts = _.union(collections.javascripts, defaultCollections.javascripts);
        options.templates   = _.union(collections.templates, defaultCollections.templates);
        options.images      = _.union(collections.images, defaultCollections.images);
        options.fonts       = _.union(collections.fonts, defaultCollections.fonts);
      } 
      grunt.verbose.writeln(util.inspect(this.files, 10, null));

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

      /* Sorted: boolean. Sort objects and properties alphabetically
       * Default: false
       */
      var finalOptions = options.sorted ? _(optionalOptions).sortObject() : optionalOptions;


      /* Format: Generate files in either JSON or YAML format
       * Default: 'json'
       */
      var stringifyFile;
      var YAML = to.format.yaml;
      var outputFormat = ((options.format).toLowerCase());
      if (outputFormat === 'yaml' || outputFormat === 'yml') {
        stringifyFile = YAML.stringify;
      } else {
        stringifyFile = JSON.stringify;
      }

      /* Generate files */
      // var addCollection = stringifyFile(optionalOptions, excludedKeys, options.indent);
      var addCollection = stringifyFile(finalOptions, null, options.indent);
      grunt.file.write(dest, addCollection);
      grunt.log.write('Creating "' + dest.magenta + '"...'); grunt.log.ok();
    });

    // Print a success message.

    done();
  }); // end of task



  /* UTILITY FUNCTIONS
   * ================= */

  var addFileToCollection = function(collection, file) {
    collection.push(file);
  };

  _.mixin({
    sortObject: function(o) {
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
    },

    /* Read optional JSON from Ben Alman, https://gist.github.com/2876125 */
    readOptionalJSON: function(filepath) {
      var data = {};
      try {
        data = grunt.file.readJSON(filepath);
      } catch (e) {}
      return data;
    },
    readOptionalYAML: function(filepath) {
      var data = {};
      try {
        data = grunt.file.readYAML(filepath);
      } catch (e) {}
      return data;
    },
    /* Function from assemble https://github.com/assemble/assemble */
    mergeOptionsArrays: function(target, name) {
      var globalArray = grunt.config(['manifest', 'options', name]) || [];
      var targetArray = grunt.config(['manifest', target, 'options', name]) || [];
      return _.union(globalArray, targetArray);
    },
    /* Function from assemble https://github.com/assemble/assemble */
    getFileExtension: function(ext) {
      var reader = grunt.file.readJSON;
      switch(ext) {
        case '.json':
          reader = grunt.file.readJSON;
          break;

        case '.yml':
        case '.yaml':
          reader = grunt.file.readYAML;
          break;
      }
      return reader;
    }
  });
};

