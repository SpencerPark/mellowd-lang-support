const del = require('del');

module.exports = function (gulp) {
    return {
        name: "brackets-plugin",
        tasks: {
            "build": {
                dependencies: ["clean"],
                require: ["codemirror:build"],
                func: function (codemirrorBuild) {
                    codemirrorBuild()
                        .pipe(gulp.dest('brackets-plugin/build/mode'));

                    return gulp.src(["main.js", "package.json"], {cwd: 'brackets-plugin'})
                        .pipe(gulp.dest('brackets-plugin/build/'));
                }
            },
            "clean": {
                func: function () {
                    return del(['brackets-plugin/build/*'])
                }
            }
        }
    }
};