/*
 * grunt-bumpup
 * https://github.com/Darsain/grunt-bumpup
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
'use strict';

module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc',
			},
			all: [
				'Gruntfile.js',
				'tasks/*.js',
			],
		},

		// Configuration to be run.
		bumpup: {
			options: {
				dateformat: 'YYYY-MM-DD HH:mm',
				normalize: false,
				timestamp: function () {
					return +new Date();
				}
			},
			files: ['test/v.json', 'test/d.json', 'test/vd.json'],
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Registering the testing task.
	grunt.registerTask('test', function (type) {
		type = type ? type : 'patch';
		grunt.task.run('bumpup:' + type);
	});

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'bumpup']);
};