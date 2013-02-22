# grunt-bumpup

Updates the `version` and `date` properties in your JSON files.

The properties are updated only when already present in the original JSON file. If a JSON file doesn't have `date` or
`version` property, the plugin won't add it.

The plugin also detects and preserves the indentation type in the original JSON file.

This is a [Grunt](http://gruntjs.com/) 0.4 plugin. If you haven't used [Grunt](http://gruntjs.com/) before, be sure to
check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

## Installation

Use npm to install and save the plugin into `devDependencies`.

```shell
npm install grunt-bumpup --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-bumpup');
```

## Configuration

In your project's Gruntfile, add a section named `bumpup` to the data object passed into `grunt.initConfig()`. This is a
simple task, and does not conform to multi task options & files input types! All available configuration styles are
described below.

This is the most verbose form of the configuration:

```js
grunt.initConfig({
	bumpup: {
		options: {
			// Options go here.
		},
		files: [
			// JSON files go here.
		],
	},
});
```

### Configuration examples:

Default options and one JSON file:

```js
grunt.initConfig({
	bumpup: 'package.json'
});
```

```js
grunt.initConfig({
	bumpup: {
		files: 'package.json'
	}
});
```

Default options, and multiple JSON files:

```js
grunt.initConfig({
	bumpup: ['package.json', 'component.json']
});
```

```js
grunt.initConfig({
	bumpup: {
		files: ['package.json', 'component.json']
	}
});
```

Custom options:

```js
grunt.initConfig({
	bumpup: {
		options: {
			dateformat: 'YYYY-MM-DD HH:mm',
			normalize: false
		},
		files: ['package.json', 'component.json']
	}
});
```

## Options

#### options.dateformat
Type: `String`
Default: `YYYY-MM-DD HH:mm:ss Z`

A date format string used by [moment.js'](http://momentjs.com) `.format()` method. To see all available format tokens,
read the [moment.js' format documentation](http://momentjs.com/docs/#/displaying/format/).

Following is the list of valid moment.js ISO-8601 (computer and human readable) date formats.

```
YYYY-MM-DD
YYYY-MM-DDTHH
YYYY-MM-DD HH
YYYY-MM-DDTHH:mm
YYYY-MM-DD HH:mm
YYYY-MM-DDTHH:mm:ss
YYYY-MM-DD HH:mm:ss
YYYY-MM-DDTHH:mm:ss.SSS
YYYY-MM-DD HH:mm:ss.SSS
YYYY-MM-DDTHH:mm:ss Z
YYYY-MM-DD HH:mm:ss Z
```

#### options.normalize
Type: `Boolean`
Default: `true`

Whether to normalize all JSON files to have the same version. The version that is than bumped up and saved into all
files is taken from the first file passed into the files array.

## Usage

You call this task from CLI with one argument, specifying the release type:

```js
grunt bump:type
```

The type can be:

- **major**: Will bump the major part of a version, resetting minor, patch, and build to 0.
- **minor**: Will bump the minor part of a version, resetting patch, and build to 0.
- **patch**: Will bump the patch part of a version, resetting build to 0.
- **build**: Will bump the build part of a version.

Version format: `major.minor.patch-build`.

The build part is adjusted only when present. If you have a `1.0.0` version, the `-build` part won't be appended unless
already present, or you've called the task with `build` argument:

```shell
grunt bumpup:build
```

### Usage Examples

#### Release task
In this example, we create a release task that handles everything needed to build a new release of your project:

```js
// Task configurations
grunt.initConfig({
	jshint: ...,
	uglify: ...,
	bumpup: 'package.json'
});

// Loading the plugins
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-bumpup');

// Alias task for release
grunt.registerTask('release', function (release) {
	release = release ? release : 'patch';
	grunt.task.run('jshint');            // Lint stuff
	grunt.task.run('uglify');            // Minify stuff
	grunt.task.run('bumpup:' + release); // Bump up the version
});
```

And now you can call it from CLI like this:

```shell
grunt release:minor
```