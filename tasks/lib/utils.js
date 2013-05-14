/*
 * assemble-manifest
 * globbing-utils
 * https://github.com/assemble/assemble-manifest
 *
 * Copyright (c) 2013 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

// External libs.
var fs        = require('fs');
var path      = require('path');
var grunt     = require("grunt");
var _         = require("lodash");
var minimatch = require("minimatch");


exports.init = function(grunt) {
  var exports = {};
  // var exports = module.exports = {};
  // var exports.toString = Object.prototype.toString;

  exports.globFiles = function(src) {
    var content;
    return content = grunt.file.expand(src)
      .map(grunt.file.read)
      .join(grunt.util.normalizelf(grunt.util.linefeed));
  };

  // Credit: @doowb, from assemble/helper-lib
  exports.buildObjectPaths = function(obj) {
    var files = [];
    _.forOwn(obj, function(value, key) {
      var file = key;
      var recurse = function(obj) {
        return _.forOwn(obj, function(value, key) {
          if (file.length !== 0) {
            file += '/';
          }
          file += key;
          if (_.isObject(value)) {
            return recurse(value);
          }
        });
      };
      if (_.isObject(value)) {
        recurse(value);
      }
      return files.push(file);
    });
    return files;
  };

  exports.globObject = function(obj, pattern) {
    var files = exports.buildObjectPaths(obj);
    var matches = files.filter(minimatch.filter(pattern));
    var rtn = {};
    var getValue = function(obj, path) {
      var keys = path.split('/');
      var value = _.cloneDeep(obj);
      _.forEach(keys, function(key) {
        if (_.has(value, key)) {
          return value = _.cloneDeep(value[key]);
        }
      });
      return value;
    };
    var setValue = function(obj, path, value) {
      var keys = path.split('/');
      var key = keys.shift();
      if (keys.length) {
        obj[key] = setValue({}, keys.join('/'), value);
      } else {
        obj[key] = value;
      }
      return obj;
    };
    _.forEach(matches, function(match) {
      var value = getValue(obj, match);
      return rtn = setValue(rtn, match, value);
    });
    return rtn;
  };

  return exports;
};
