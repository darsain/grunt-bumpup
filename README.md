# grunt-bumpup

Updates the `version`, `date`, and other properties in your JSON files.

The properties are updated only when already present in the original JSON file.

The plugin also detects and preserves the original indentation style.

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
		file: 'package.json'
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

#### options.normalize
Type: `Boolean`
Default: `true`

Whether to normalize all JSON files to have the same version. The version that is than bumped up and saved into all
files is taken from the first file passed into the files array.

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

The dates are set in the UTC timezone, so including the Z token is recommended.

## Custom setters

You can define your own property setters by passing them as a function in options object as a property name that should
be updated. For example, this will update the `timestamp` property inside `package.json`:

```js
grunt.initConfig({
	bumpup: {
		options: {
			timestamp: function (old) {
				return +new Date();
			}
		},
		file: 'package.json'
	}
});
```

You can also override the default property setters for `version` and `date` properties if you want some more control,
or, lets say in a `version` property, when you are not using a Semantic Versioning, and need to define a custom version
bumping style.

### Setter arguments

All setters receive the old property value as a first argument.

The `version` setter receives the bump type from the CLI `bumpup:type` as a 2nd argument. Example:

```js
grunt.initConfig({
	bumpup: {
		options: {
			version: function (old, type) {
				return newVersion; // Bump based on a `type` argument
			}
		},
		file: 'package.json'
	}
});
```

The `date` setter receives the `option.dateformat` as a 2nd argument.

```js
grunt.initConfig({
	bumpup: {
		options: {
			date: function (old, dateformat) {
				return moment.utc().format(dateformat);
			}
		},
		file: 'package.json'
	}
});
```

### Return values

Each setter has to return the new property value, or when something went wrong, `grunt.fail.warn()` an error and return
`undefined`.

## Usage

You call this task from the CLI with one argument, specifying the release type:

```js
grunt bumpup:type
```

The default `version` setter accepts these types:

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

## Usage Examples

#### Release task
In this example, we create a "release" task alias that handles everything needed to build a new project release:

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
grunt.registerTask('release', function (type) {
	type = type ? type : 'patch';     // Set the release type
	grunt.task.run('jshint');         // Lint stuff
	grunt.task.run('uglify');         // Minify stuff
	grunt.task.run('bumpup:' + type); // Bump up the version
});
```

And now you can call it from CLI like this:

```shell
grunt release:minor
```

#### Updating config properties

After bumpup executes, it updates the JSON properties that other tasks in queue running after it might want to use. For
example, if you have a `pkg` config property for easy access:

```js
grunt.initConfig({
	pkg: grunt.file.readJSON('package.json')
});
```

And you want to execute a task that uses this property immediately after bumpup, you have to tell grunt that
this property has changed. You can update the property like this:

```js
grunt.config.set('pkg', grunt.file.readJSON('package.json'));
```

But this has to be done in the grunt task queue right after the bumpup, otherwise it won't have any effect, as grunt
tasks are asynchronous. The solution is to place it into an alias task, add to queue right after bumpup. This is the
final release task using updating `pkg` property:

```js
// Task for updating the pkg config property. Needs to be run after
// bumpup so the next tasks in queue can work with updated values.
grunt.registerTask('updatePkg', function () {
	grunt.config.set('pkg', grunt.file.readJSON('component.json'));
});

// Release task.
grunt.registerTask('release', function (type) {
	type = type ? type : 'patch';
	grunt.task.run('jshint');
	grunt.task.run('bumpup:' + type);
	grunt.task.run('updatePkg');
	grunt.task.run('build');
	grunt.task.run('tagrelease');
});
```