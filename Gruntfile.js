module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
			options: {
				globals: {
					jQuery: true
				}
			}
		},
		watch: {
			files: ['src/**'],
			tasks: ['rebuild']
		},
		concat: {
			dist: {
				src: [
					'src/Base.js',
					'src/Observable.js',
					'src/model/Field.js',
					'src/model/Model.js',
					'src/model/LocationModel.js',
					'src/controller/Controller.js',
					'src/controller/GPS.js',
					'src/view/View.js',
					'src/view/Map.js',
					'src/view/Compass.js',
					'src/Arrow.js'
				],
				dest: 'dist/arrow.all.js',
			},
		},
		uglify: {
			app: {
				files: {
						'dist/arrow.min.js': ['src/**.js']
					}
			},
			beautify: {
				options: {
					beautify: {
						width: 80,
						beautify: true
					}
				},
				files: {
					"src/**.js": ["src/**.js"] 
				}
			}
		},
		clean: ["dist"],
		bower: {
			release: {
				dest: "dist/vendor"
			}
		},
		copy: {
			themes: {
				files: [
					{expand: true, cwd: 'src', src: 'theme/**', dest: './dist/'}
				]
			},
			bower: {
				files: [
					{expand: true, cwd: 'bower_components', src: '**', dest: './dist/vendor'}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bower');
	
	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('all', ['clean','concat', 'uglify:app', 'copy:themes', 'copy:bower']);
	grunt.registerTask('rebuild', ['concat', 'uglify:app', 'copy:themes']);
	grunt.registerTask('beautify', ['uglify:beautify']);
};