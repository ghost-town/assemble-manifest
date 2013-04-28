# [assemble-manifest v0.1.1](http://github.com/assemble/assemble-manifest) [![Build Status](https://travis-ci.org/assemble/assemble-manifest.png)](https://travis-ci.org/assemble/assemble-manifest)

> Generates JSON and/or YAML manifest files from given source files or directories or source files.

See some of the [example manifests](https://github.com/assemble/assemble-manifest/tree/master/test/actual) generated with this task.


Use this task to generate:

* Component manifests
* jQuery package manifests
* package.json
* component.json
* JSON or YAML formatted list of all files in given directories, sorted by type.

Or just use it to sync the metadata in your root `.json` files: `package.json`, `component.json`, `*.jquery.json` etc.


## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install assemble-manifest --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('assemble-manifest');
```

## The "manifest" task

### Overview
In your project's Gruntfile, add a section named `manifest` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  manifest: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    }
  }
})
```


### Options
_Documentation forthcoming_

#### format
Type: `String`
Default: `json`

Option to specify output format for dest files. Case insensitive, and may be either YAML or JSON format. Any of the following will work:

* `'yml'`, `'yaml'`, `'YML'`, `'YAML'`
* `'json'`, `'JSON'` (although these are uncessary since the task defaults to json)


#### sorted
Type: `Boolean`
Default: `false`

Sorts ouput objects and properties in alphabetical order.


#### indent
Type: `Number`
Default: `2`

Number of spaces to indent the output. Currently only works for `.json` files, not `.yml`.


#### debug
Type: `Boolean`
Default: `false`

When set to `true`, the output will include all omitted properties for inspection.


## Collections
Type: `Arrays|Objects`
Default: `documents|fonts|images|javascripts|markdown|styles|templates`

> Generate arrays of files with specific extensions from given source directories. 

Currently limited to file types defined in the code. We realize this part of the task is somewhat hard-coded for our own usage, so the plan is to allow collections and extensions to be user-defined, through the task and target options. 

By default, currently the task will build the following types of collections, and with the specified extensions for each collection:

#### documents
* `.md`
* `.txt`
* `.doc`
* `.docx`
* `.pdf`

#### fonts
* `.eot`
* `.svg`
* `.otf`
* `.ttf`
* `.woff`

#### images
* `.ico`
* `.png`
* `.gif`
* `.jpg`

#### javascripts
* `.js`
* `.coffee`

#### markdown
* `.md`
* `.markd`
* `.markdown`

#### styles
* `.css`
* `.less`
* `.stylus`
* `.sass`
* `.scss`

#### templates
* `.hbs`
* `.hbr`
* `.handlebars`
* `.html`
* `.htm`
* `.mustache`
* `.tmpl`


To build a specific collection, just add the extension pattern(s) for the `src` files you want to add to your dest file(s). You don't need to do anything to explicity add the collection itself, the task takes care of that for you. For example:

``` js
images: {
  options: {
    name: 'Image Manifest'
  },
  files: {
    'dest/images.json': ['assets/images/**/*.{jpg,png,gif}'],
  }
}
```

### Example manifest
Any `package.json` or `component.json` is an example of what this task can create. Here is an example in `yaml` format.

``` yaml
name: assemble-manifest
description: Generates JSON and/or YAML manifest files from given source files or directories or source files.
... 
```




### Usage Examples

Example target to build a `component.json` from a `package.json`. You may: 

 * Do a one-to-one transfer of objects and properties
 * Override any objects or properties in the options by simply adding the new value to the options. 
 * Remove any objects or properties in the options by making the value `undefined` (this is a quick fix, will revisit but it works for now.)
 * Define new objects and properties in the options block.
 

``` js
manifest: {
  options: {
    debug: true,
    indent: 2,
    sorted: false,
    output: 'json',  // json or yaml, case insensitive
    version: '0.1.0', // keep versions synched
    devDependencies: undefined, // remove object
  },
  // build component.json from package.json
  component: {
    files: {
      'component.json': ['package.json']
    }
  }
}
```

#### Default Options

``` js
manifest: {
  options: {
    debug: true,
    indent: 2,
    sorted: false,
    output: 'json',
    version: '1.7.5',
    dependencies: {
      'amdefine': '0.0.4',
      'chai': '~1.5.0',
      'grunt': '~0.4.0',
      'grunt-contrib-jshint': '~0.1.0',
      'grunt-contrib-watch': '~0.2.0',
      'grunt-mocha-test': '~0.2.0',
      'grunt-release': '~0.2.0',
      'handlebars': '~1.0.9',
      'testem': '~0.2.68'
    }
  },
  // build component.json from package.json
  component: {
    files: {
      'component.json': ['package.json']
    }
  }
}
```

#### Custom Options
_On the way..._


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
