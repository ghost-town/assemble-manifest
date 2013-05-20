
'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('metadata', 'Sync metadata across JSON and YAML files.', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      pkg: null,
      component: null,
      main: null,
      dependencies: null,
      props: []
    });

    var pkg_path = options.pkg || 'package.json';
    var component_path = options.component || 'component.json';

    if (!grunt.file.exists(pkg_path)) {
      grunt.log.warn('The "' + pkg_path + '" not found.');
      return false;
    }
    var pkg = grunt.file.readJSON(pkg_path);
    var component = {};

    options.props.forEach(function(key) {
      if (pkg[key]) {
        component[key] = pkg[key];
      }
    });
    if (options.main) {
      component.main = options.main;
    }
    if (options.dependencies) {
      if (!component.dependencies) {
        component.dependencies = {};
      }
      for (var key in options.dependencies) {
        component.dependencies[key] = options.dependencies[key];
      }
    }
    grunt.file.write(component_path, JSON.stringify(component, null, 2));
    grunt.log.writeln('File "' + component_path + '" created.');

  });

};