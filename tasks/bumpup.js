/*
 * grunt-bumpup
 * https://github.com/Darsain/grunt-bumpup
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
'use strict';

var semver = require('semver');
var moment = require('moment');

/**
 * Detect and return the indentation.
 *
 * @param  {String} string
 *
 * @return {Mixed} Indentation used, or undefined.
 */
function detectIndentation(string) {
	var tabs   = string.match(/^[\t]+/gm) || [];
	var spaces = string.match(/^[ ]+/gm) || [];
	var none   = string.match(/^("|\{|\})/gm) || [];

	// Return empty string if thats the case
	if (none.length > tabs.length && none.length > spaces.length) {
		return '';
	}

	// Pick the smalles indentation level of a prevalent type
	var prevalent = tabs.length > spaces.length ? tabs : spaces;
	var indentation;
	for (var p = 0, pl = prevalent.length; p < pl; p++) {
		if (!indentation || prevalent[p].length < indentation.length) {
			indentation = prevalent[p];
		}
	}
	return indentation;
}

/**
 * Return type of the value.
 *
 * @param  {Mixed} value
 *
 * @return {String}
 */
function type(value) {
	return Object.prototype.toString.call(value).match(/^\[object ([a-z]+)\]$/i)[1].toLowerCase();
}

module.exports = function(grunt) {
	// Error handler
	function failed(error, message) {
		if (error) {
			grunt.verbose.error(error);
		}
		grunt.fail.warn(message || 'Tagrelease task failed.');
	}

	// Task definition
	grunt.registerTask('bumpup', 'Bumping up version & date properties.', function (release) {
		// Normalize the release type
		if (typeof release === 'string') {
			release = release.toLowerCase();
			if (!/^(major|minor|patch|build)$/i.test(release)) {
				failed(null, '"' + release + '" is not a valid release type: major, minor, patch, or build.');
				return;
			}
		} else {
			release = 'patch';
		}

		// Get configuration and set the options
		var taskConfig = grunt.config('bumpup');
		var config = ['string', 'array'].indexOf(type(taskConfig)) !== -1 ? { files: taskConfig } : taskConfig;
		var files  = type(config.files) === 'array' ? config.files : [config.files];
		var o      = grunt.util._.extend({
			dateformat: 'YYYY-MM-DD HH:mm:ss Z',
			normalize: true
		}, config.options || {});
		var newDate = moment.utc().format(o.dateformat);
		var normVersion;

		if (!files.length) {
			grunt.log.warn('Nothing to bump up.');
			return;
		}

		// Bumpup the files
		files.filter(function (filepath) {
			// Remove nonexistent files.
			if (!grunt.file.exists(filepath)) {
				grunt.log.warn('File "' + filepath + '" not found.');
				return false;
			} else {
				return true;
			}
		}).forEach(function (filepath) {
			try {
				var file = grunt.file.read(filepath);
				var meta = JSON.parse(file);
				var indentation = detectIndentation(file);
				var newVersion;

				// Update version property
				if (typeof meta.version !== 'undefined') {
					var oldVersion = semver.valid(meta.version);
					if (!oldVersion && !o.normalize || !oldVersion && o.normalize && !normVersion) {
						grunt.log.warn('Version in "' + filepath + '" is not a valid semantic version.');
					} else {
						if (!normVersion) {
							normVersion = semver.inc(oldVersion, release);
						}
						newVersion = o.normalize ? normVersion : semver.inc(oldVersion, release);
					}

					if (newVersion) {
						grunt.log.writeln('Bumping "' + filepath + '" version to: ' + newVersion);
						meta.version = newVersion;
					}
				}

				// Update date property
				if (typeof meta.date !== 'undefined') {
					grunt.log.writeln('Bumping "' + filepath + '" date to: ' + newDate);
					meta.date = newDate;
				}

				// Stringify new metafile and save
				if (!grunt.file.write(filepath, JSON.stringify(meta, null, indentation))) {
					grunt.log.warn('Couldn\'t write to "' + filepath + '"');
				}
			} catch (error) {
				failed(error, 'Bumpup failed.');
			}
		}, this);
	});
};