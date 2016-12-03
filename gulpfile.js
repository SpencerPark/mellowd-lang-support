//plugins
const gulp = require("gulp");

const loadSubmodule = require("./gulp-submodule")(gulp);

//Submodules
loadSubmodule(require('./brackets-plugin/gulpfile'));
loadSubmodule(require('./codemirror/gulpfile'));

gulp.task('build', ['codemirror:build', 'brackets-plugin:build']);