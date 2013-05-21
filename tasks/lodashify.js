module.exports = function(grunt) {

  // 'use strict';
  var _ = require('lodash');
  var util = require('util');
  var path = require('path');
  var to   = require('to');


  grunt.registerMultiTask('lodashify', 'Flatten a folder to a JSON file representing its contents', function() {

    // Task config
    var options = this.options({
      basepath: 'basepath',
      format: 'json',
      lodash: true,
      indent: 2
    });

    var indentation = options.indent;
    var src = this.data.src;
    var dest = this.data.dest;

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

    // Error checking
    if (!src) {
      grunt.log.error('You must specify a src folder');
      return false;
    }
    if (!dest) {
      grunt.log.error('You must specify a destination JSON file');
      return false;
    }
    if (!grunt.file.exists(src) || !grunt.file.isDir(src)) {
      grunt.log.error('Specified src folder does not exist');
      return false;
    }

    // If src has a trailing slash, remove it
    if (src.substr(-1) === path.sep) {
      src = src.substr(0, src.length - 1);
    }

    var urlNormalize = function(urlString, sep) {
      return urlString.replace(/(\\|\/)/g, sep);
    };

    // Get key from path, e.g. 'src/data/alert.json' -> 'alert'
    var getKey = function(filepath) {
      var key = filepath.split(path.sep).slice(-1)[0];
      if (key.lastIndexOf('.') > 0) {
        key = key.substr(0, key.lastIndexOf('.'));
      }
      key = path.basename(filepath, path.extname(filepath));
      return key.replace(/\-|\./g, '_');
    };

    var baseSourceFilesPath = path.dirname(src);

    var processDir = function(dir, indent) {

      var result = {};
      var contents = grunt.file.expand(dir + path.sep + '*').filter(removeExclusions);
      var i = contents.length;


      // Customize the name of the "basepath" key that is 
      // merged into each files object 
      var pathprefix = {};
      var pathPrefixKey = options.basepath;
      pathprefix[pathPrefixKey] = dir;

      while (i--) {
        var prop = contents[i];
        var key = getKey(prop);

        // Directory of current property
        dir = path.dirname(prop);

        var pathArray = dir.split('/');
        var pathDots  = pathArray.join('.');

        var lodashedPath = "<%= " + path.basename(dir) + '.' + pathPrefixKey + " %>/" + path.basename(prop);

        var value;
        if (grunt.file.isDir(prop)) {
          value = processDir(prop);
          if (value === false) {
            return false;
          }
        } else {
          if (options.lodash) {
            value = lodashedPath;
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

    grunt.log.ok('Writing file ' + dest + '...' + 'OK'.green);
    grunt.file.write(dest, stringifyFile(result, null, indentation));

  });

};