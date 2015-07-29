/*!
 * Author: Viacheslav Lotsmanov
 * License: GNU/GPLv3 by Free Software Foundation
 */

module.exports = function (grunt) {

    var pkg = grunt.file.readJSON('package.json');

    var key;

    var styles = {};
    var stylesCopyList = [];

    var scripts = {
        concat: {},
        preprocess: {},
        uglify_files: {},
        jshint_files: ['Gruntfile.js'],
        wrap_files: [],
        amdwrap_libs_files: [],
        amdwrap_src_files: [],
        copyList: [],
    };

    var watch = {
        js: [],
        less: [],
        all: [],
    };

    var cleanJS = [];
    var cleanLess = [];
    var cleanSprites = [];

    var sprites = {};

    if (pkg.grunt.styles) // styles {{{1
    pkg.grunt.styles.forEach(function (item, i) {
        // watch
        var lessWatch = [
            item.path + '/src/**/*.less',
            item.path + '/libs/**/*.less',
        ];
        Array.prototype.push.apply(watch.less, lessWatch);
        Array.prototype.push.apply(watch.all, lessWatch);

        // clean
        if (item.cleanOnlyFiles) {
            cleanLess.push(item.path + '/build/**/*.less');
        } else {
            cleanLess.push(item.path + '/build');
        }

        // less compile
        var lessFiles = {};
        for (var key in item.files) {
            lessFiles[item.path +'/build/'+ key] = item.path +'/src/'+ item.files[key];

            // copy
            if (item.copyBuildTo) {
                stylesCopyList.push({
                    src: item.path +'/build/'+ key,
                    dest: item.copyBuildTo + '/' + key,
                });
            }
        }
        styles['development_'+i] = {
            options: {
                paths: [
                    item.path + '/libs',
                    item.path + '/src',
                ],
            },
            files: lessFiles,
        };
        styles['production_'+i] = {
            options: {
                paths: [
                    item.path + '/libs',
                    item.path + '/src',
                ],
                compress: true,
            },
            files: lessFiles,
        };
    }); // styles }}}1

    if (pkg.grunt.scripts) // scripts {{{1
    pkg.grunt.scripts.forEach(function (item, i) {
        // minification
        var buildFilePath = item.path +'/build/'+ item.buildFile;
        scripts.uglify_files[buildFilePath] = buildFilePath;

        // preprocess variables
        var context;
        var variablesPath = item.path + '/src/preprocess_context.json';
        try { context = grunt.file.readJSON(variablesPath); } catch (err) { context = {}; }
        var preprocessSrc = [ '**/*.js' ];
        if (item.amd) {
            // ignore libs
            preprocessSrc.push('!libs/**/*.js');
        }
        scripts.preprocess['js_'+i] = {
            options: { context: context },
            files: [{
                expand: true,
                cwd: item.path + '/build/wrap/',
                src: preprocessSrc,
                dest: item.path + '/build/processed/',
            }],
        };

        // concat
        var concatSrc = [
            item.path + '/build/processed/**/*.js',
        ];
        if (item.amd) {
            concatSrc.unshift(item.path + '/build/wrap/libs/**/*.js');
            if (item.notAmdFiles) {
                item.notAmdFiles.reverse().forEach(function (val) {
                    concatSrc.unshift(item.path + '/libs/' + val);
                    concatSrc.unshift(item.path + '/src/' + val);
                });
            }
        } else {
            concatSrc.unshift(item.path + '/libs/**/*.js');
        }
        scripts.concat['js_'+i] = {
            options: { separator: '\n;\n' },
            src: concatSrc,
            dest: buildFilePath,
        };

        // js hint
        scripts.jshint_files.push(item.path + '/build/processed/**/*.js');
        if (item.amd) {
            // ignore libs
            scripts.jshint_files.push('!' + item.path + '/build/processed/libs/**/*.js');
        }

        // watch
        var jsWatch = [
            item.path + '/libs/**/*.js',
            item.path + '/src/**/*.js',
        ];
        Array.prototype.push.apply(watch.js, jsWatch);
        Array.prototype.push.apply(watch.all, jsWatch);

        // clean
        if (item.cleanOnlyFiles) {
            cleanJS.push(item.path + '/build/**/*.js');
        } else {
            cleanJS.push(item.path + '/build');
        }

        // wrap
        if (item.amd) {
            var wrapSrc = [ '**/*.js' ];
            if (item.notAmdFiles) {
                item.notAmdFiles.forEach(function (val) {
                    wrapSrc.push('!' + val);
                });
            }
            scripts.amdwrap_libs_files.push({
                expand: true,
                cwd: item.path + '/libs/',
                src: wrapSrc,
                dest: item.path + '/build/wrap/libs/',
            });
            scripts.amdwrap_src_files.push({
                expand: true,
                cwd: item.path + '/src/',
                src: wrapSrc,
                dest: item.path + '/build/wrap/',
            });
        } else {
            scripts.wrap_files.push({
                expand: true,
                cwd: item.path + '/src/',
                src: [ '**/*.js' ],
                dest: item.path + '/build/wrap/',
            });
        }

        // copy
        if (item.copyBuildTo) {
            scripts.copyList.push({
                src: buildFilePath,
                dest: item.copyBuildTo + '/' + item.buildFile,
            });
        }
    }); // scripts }}}1

    if (pkg.grunt.sprites) // sprites {{{1
    (function () {
        var key, options, item, task;

        for (key in pkg.grunt.sprites) {
            item = pkg.grunt.sprites[key];

            options = {
                margin: 1,
                style: item.css,
            };

            if ('base64' in item) options.base64 = item.base64;
            if ('margin' in item) options.margin = item.margin;

            task = { options: options, src: item.src };

            if (!item.base64 && item.sprite) {
                task.dest = item.sprite;
                cleanSprites.push(item.sprite);
            }

            cleanSprites.push(item.css);

            sprites[ key ] = task;
        }
    })(); // sprites }}}1

    grunt.initConfig({ // {{{1
        configs: pkg.grunt,
        concat: scripts.concat,
        uglify: {
            js: {
                options: { preserveComments: 'some' },
                files: scripts.uglify_files,
            },
        },
        preprocess: scripts.preprocess,
        jshint: {
            options: {
                browser: true,
                jquery: true,
            },
            all: scripts.jshint_files,
        },
        watch: {
            js: {
                files: watch.js,
                tasks: [ 'build-js' ],
            },
            less: {
                files: watch.less,
                tasks: [ 'build-less' ],
            },
            all: {
                files: watch.all,
                tasks: [ 'build' ],
            },
        },
        less: styles,
        wrap: {
            js: {
                options: {
                    wrapper: ['\n;(function () {\n', '\n})();\n'],
                },
                files: scripts.wrap_files,
            },
        },
        amdwrap: {
            libs: {
                options: { dir: 'libs' },
                files: scripts.amdwrap_libs_files,
            },
            src: {
                files: scripts.amdwrap_src_files,
            },
        },
        copy: {
            js: { files: scripts.copyList },
            less: { files: stylesCopyList },
        },
        'grunt-clean': {
            js: cleanJS,
            less: cleanLess,
            sprites: cleanSprites,
            dist: [ 'grunt', 'node_modules' ],
        },
        css_sprite: sprites,
    }); // grunt.initConfig }}}1

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-wrap');
    grunt.loadNpmTasks('grunt-amdwrap');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('css-sprite');

    grunt.task.renameTask('clean', 'grunt-clean');

    // prepare additional tasks {{{1

    // concat
    var buildConcat = [];
    for (key in scripts.concat) {
        buildConcat.push('concat:' + key);
    }
    grunt.registerTask('build-concat', buildConcat);

    // preprocess
    var buildPreprocess = [];
    for (key in scripts.preprocess) {
        buildPreprocess.push('preprocess:' + key);
    }
    grunt.registerTask('build-preprocess', buildPreprocess);

    var buildJS = [
        'clean-js',
        'wrap:js', 'amdwrap:libs', 'amdwrap:src',
        'build-preprocess',
    ];
    var buildJSPart2 = [
        'build-concat',
        'copy:js',
    ];
    if (pkg.grunt.jshint.development) {
        buildJS.push('jshint');
    }
    buildJS = buildJS.concat(buildJSPart2);

    var buildJSProduction = [
        'clean-js',
        'wrap:js', 'amdwrap:libs', 'amdwrap:src',
        'build-preprocess',
    ];
    var buildJSProductionPart2 = [
        'build-concat',
        'uglify:js',
        'copy:js',
    ];
    if (pkg.grunt.jshint.production) {
        buildJSProduction.push('jshint');
    }
    buildJSProduction = buildJSProduction.concat(buildJSProductionPart2);

    // less
    var buildLess = ['clean-less'];
    var buildLessProduction = ['clean-less'];
    for (key in styles) {
        if (/^development/.test(key)) {
            buildLess.push('less:' + key);
        }
        if (/^production/.test(key)) {
            buildLessProduction.push('less:' + key);
        }
    }
    buildLess.push('copy:less');
    buildLessProduction.push('copy:less');

    // prepare additional tasks }}}1

    grunt.registerTask('build-js', buildJS);
    grunt.registerTask('build-js-production', buildJSProduction);
    grunt.registerTask('build-less', buildLess);
    grunt.registerTask('build-less-production', buildLessProduction);
    grunt.registerTask('build', ['build-js', 'build-less']);
    grunt.registerTask('watcher-js', ['watch:js']);
    grunt.registerTask('watcher-less', ['watch:less']);
    grunt.registerTask('watcher', ['watch:all']);
    grunt.registerTask('clean', ['grunt-clean:js', 'grunt-clean:less']);
    grunt.registerTask('clean-js', ['grunt-clean:js']);
    grunt.registerTask('clean-less', ['grunt-clean:less']);
    grunt.registerTask('clean-sprites', ['grunt-clean:sprites']);
    grunt.registerTask('distclean', ['grunt-clean:dist']);
    grunt.registerTask('development', ['build']);
    grunt.registerTask('production', [
        'build-js-production',
        'build-less-production',
    ]);
    grunt.registerTask('gen-sprites', ['css_sprite']);
    grunt.registerTask('default', ['production']);

};
