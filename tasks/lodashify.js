module.exports = function(grunt) {

  // 'use strict';
  var _ = require('lodash');
  var util = require('util');
  var path = require('path');


  grunt.registerMultiTask('lodashify', 'Flatten a folder to a JSON file representing its contents', function() {

    // Task config
    var options = this.options({
      lodash: true,
      indent: 2
    });

    var indentation = options.indent;
    var src = this.data.src;
    var dest = this.data.dest;

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

    // Get key from path, e.g. 'src/data/alert.json' -> 'alert'
    var getKey = function(filepath) {
      var key = filepath.split(path.sep).slice(-1)[0];
      if (key.lastIndexOf('.') > 0) {
        key = key.substr(0, key.lastIndexOf('.'));
      }
      key = path.basename(filepath, path.extname(filepath));
      return key;
    };

    
    var processDir = function(dir, indent) {

      var result = {};
      var contents = grunt.file.expand(dir + path.sep + '*').filter(removeExclusions);
      var i = contents.length;
      while (i--) {
        var item = contents[i];
        var key = getKey(item);

        dir = path.dirname(item);
        var pathArray = dir.split('/');
        // grunt.log.writeln('Path array: '.yellow + util.inspect(pathArray.length, 10, null).yellow);

        // Tried to create a loop but it always gives me [Object object]
        // var firstSegment = pathArray[3];
        // var segmentLast = pathArray[pathArray.length - 2];
        // var secondLast  = pathArray[pathArray.length - 3];
        // var thirdLast   = pathArray[pathArray.length - 4];

        // This is close, but 
        var lodashedPath = "<%= " + pathArray.join('.') + " %>/" + path.basename(item);
        // var lodashedPath = "<%= " + thirdLast + '.' + secondLast + '.' + segmentLast + " %>/" + path.basename(item);

        var value;
        if (grunt.file.isDir(item)) {
          value = processDir(item);
          if (value === false) {
            return false;
          }
        } else {
          if (options.lodash) {
            value = lodashedPath;
          } else {
            value = item;
          }
        }
        grunt.verbose.writeln(util.inspect(value, 10, null).yellow);
        result[key] = value;
      }
      return result;
    };
    var result = processDir(src);

    if (result === false) {
      return false;
    }

    grunt.log.ok('Writing file ' + dest + '...' + 'OK'.green);
    grunt.file.write(dest, JSON.stringify(result, null, indentation));

  });

};