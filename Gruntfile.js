var jiplc   = require('./src/jiplc.js');
var path    = require('path');

module.exports = function(grunt)
{
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),

        //
        //
        //
        mkdir: {
            all: {
                options: {
                    mode: 0700,
                    create: ['tmp']
                },
            },
        },

        //
        //
        //
        jiplc : {
            options : {
                files           : ['src/jpx.jipl.js'],
                outputFile      : 'jpx.js',
                outputDirectory : 'dist'
            }
        },

        //
        //
        //
        yuidoc : {
            compile: {
                name        : '<%= pkg.name %>',
                description : '<%= pkg.description %>',
                version     : '<%= pkg.version %>',
                url         : '<%= pkg.homepage %>',
                options: {
                    paths       : 'src',
                    themedir    : 'docs/yuidoc-theme-blue-dc',
                    outdir      : 'docs/api',
                    nosort      : true
                }
            }
        },

        //
        //
        //
        concat: {
            options: {

            },
            dist1: {
                src: ['src/license.js','dist/jpx.js'],
                dest: 'dist/jpx.js',
            },
            dist2: {
                src: ['src/license.js','dist/jpx.min.js'],
                dest: 'dist/jpx.min.js',
            },
            dist3: {
                src: ['src/license.js','dist/jiplc.js'],
                dest: 'dist/jiplc.js',
            },
            dist4: {
                src: ['src/license.js','dist/jiplc.min.js'],
                dest: 'dist/jiplc.min.js',
            }
        },

        //
        //
        //
        uglify:
        {
            options: {
                mangle      : true,
                compress    : true
            },
            dist: {
                files:
                {
                    'dist/jpx.min.js'   : 'dist/jpx.js',
                    'dist/jiplc.min.js' : 'src/jiplc.js'
                }
            }
        },

        //
        //
        //
        copy: {
            jiplc: {
                files: [
                    // includes files within path
                    {
                        expand  : true,
                        cwd     : 'src',
                        src     : ['jiplc.js'],
                        dest    : 'dist/',
                        filter  : 'isFile'
                    }
                ]
            }
        },

        //
        //
        //
        qunit:
        {
            files: ['test/**/*.html']
        },

        //
        //
        //
        jshint:
        {
            files: [
                'Gruntfile.js',
                'src/jiplc.js',
                'dist/jpx.js'
            ],
            options:
            {
                eqeqeq      : true,
                freeze      : true,
                shadow      : true,
                globals:
                {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        }
    });

    //
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    //
    grunt.registerTask('jiplc', [], function()
    {
        var files           = this.options('files').files;
        var outputDirectory = this.options('outputDirectory').outputDirectory;
        var outputFile      = this.options('outputFile').outputFile;
        var contents        = "";
        for(var i = 0; i < files.length; ++i)
        {
            contents += grunt.file.read(files[i],{encoding:'utf-8'});
        }
        contents = jiplc.compile(contents);
        var output = path.join(outputDirectory,outputFile);
        grunt.log.writeln("Output to '" + output + "'");
        grunt.file.write(output,contents,{encoding:'utf-8'});
    });

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', [
        'jiplc',
        'jshint',
        'uglify',
        'copy:jiplc',
        'concat:dist1',
        'concat:dist2',
        'concat:dist3',
        'concat:dist4',
        'yuidoc']);
};
