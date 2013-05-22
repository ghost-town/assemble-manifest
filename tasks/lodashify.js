module.exports = function(grunt) {

  'use strict';


  var util = require('util');
  var path = require('path');
  var to   = require('to');
  var _    = require('lodash');


  grunt.registerMultiTask('lodashify', 'Flatten a folder to a JSON file representing its contents', function() {

    // Task config
    var options = this.options({
      basepath: 'basepath',
      format: 'json',
      lodashify: true,
      indent: 2
    });

    var indentation = options.indent;

    // Omit given files or extensions from the result
    var exclusions = ['node_modules', 'npm-debug.log', 'tmp'];
    if (options.exclude) {
      exclusions = exclusions.concat(options.exclude);
    }
    var removeExclusions = function(item) {
      var i = exclusions.length;
      while (i--) {
        if (grunt.file.isMatch(exclusions[i], item)) {
          return false;
        }
      }
      return true;
    };

    grunt.verbose.writeflags(options, 'Lodashify options');

    var files     = this.files;
    var srcFiles  = files.src;
    var destFiles = files.dest;

    var src  = this.data.src;
    var dest = this.data.dest;

    var processDir = function(dir, indent) {

      var files = grunt.file.expand(dir + path.sep + '*').filter(removeExclusions);
      var i      = files.length;
      var result = {};

      // Customize the name of the "basepath" key 
      // that is merged into each files object 
      var pathprefix = {};
      var pathPrefixKey = options.basepath;
      pathprefix[pathPrefixKey] = dir;

      while (i--) {
        var prop = files[i];
        var key = getKey(prop);
        dir = path.dirname(prop);

        // Convert paths to lodash/underscore templates.
        var lodashifyPath = "<%= " + path.basename(dest, path.extname(dest)) + '.' + path.basename(dir) + '.' + pathPrefixKey + " %>/" + path.basename(prop);

        var value;
        if (grunt.file.isDir(prop)) {
          value = processDir(prop);
          if (value === false) {
            return false;
          }
        } else {
          if (options.lodashify) {
            value = lodashifyPath;
          } else {
            value = prop;
          }
        }
        grunt.verbose.writeln(util.inspect(value, 10, null).yellow);
        result[key] = value;
      }
      // Merge the "basepath" key into returned objects
      return _.merge(pathprefix, result);
    };

    var result = processDir(src);
    if (result === false) {
      return false;
    }



    // User-defined option to stringify to JSON or YAML
    var stringifyFile = function(opts, values, indent) {
      var YAML = to.format.yaml;
      var outputFormat = ((options.format).toLowerCase());
      if (outputFormat === 'yaml' || outputFormat === 'yml') {
        stringifyFile = YAML.stringify(opts, values, indent);
      } else {
        stringifyFile = JSON.stringify(opts, values, indent);
      }
      return stringifyFile;
    };

    grunt.log.ok('Writing file ' + dest + '...' + 'OK'.green);
    // Write dest files.
    grunt.file.write(dest, stringifyFile(result, null, indentation));
  });

  // Get key from path.
  // Example: 'src/data/alert.json' => 'alert'
  var getKey = function(filepath) {
    var key = filepath.split(path.sep).slice(-1)[0];
    if (key.lastIndexOf('.') > 0) {
      key = key.substr(0, key.lastIndexOf('.'));
    }
    key = path.basename(filepath, path.extname(filepath));
    return key.replace(/\-|\./g, '_');
  };

  var urlNormalize = function(urlString, sep) {
    return urlString.replace(/(\\|\/)/g, sep);
  };
};