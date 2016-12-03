const del = require('del'),
      zip = require('gulp-archiver');

module.exports = function (gulp) {
    return {
        name: "brackets-plugin",
        tasks: {
            "build": {
                require: ["codemirror:build"],
                func: function (codemirrorBuild) {
                    codemirrorBuild()
                        .pipe(gulp.dest('brackets-plugin/build/mode'));

                    return gulp.src(["main.js", "package.json"], {cwd: 'brackets-plugin'})
                        .pipe(gulp.dest('brackets-plugin/build/'));
                }
            },
            "package": {
                dependencies: ['clean', 'build'],
                func: function () {
                    return gulp.src('brackets-plugin/build/**')
                        .pipe(zip('mellowd-lang-support.zip'))
                        .pipe(gulp.dest('brackets-plugin/package/'));
                }
            },
            "clean": {
                func: function () {
                    return del(['brackets-plugin/build/*', 'brackets-plugin/package/*'])
                }
            }
        }
    }
};