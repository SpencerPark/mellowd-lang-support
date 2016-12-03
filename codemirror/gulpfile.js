const del = require('del'),
       ts = require("gulp-typescript");

//Setup the submodule under the 'codemirror' namespace
module.exports = function (gulp) {
    return {
        name: "codemirror",
        tasks: {
            "build": {
                dependencies: ["clean"],
                func: function () {
                    var tsProject = ts.createProject("./codemirror/tsconfig.json");
                    return tsProject.src()
                        .pipe(tsProject())
                        .js
                        .pipe(gulp.dest("codemirror/build/"));
                }
            },
            "clean": {
                func: function () {
                    return del(['codemirror/build/*'])
                }
            }
        }
    }
};