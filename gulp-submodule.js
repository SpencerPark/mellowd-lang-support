//A makeshift module to setup mock submodules with gulp tasks that can depend on
//each other. Gulp tasks can't really pass data between them without sharing a global
//variable so the tasks are saved as functions that are simply re-executed.

function gulpExecutor(subTaskResolver, require, func) {
    return function() {
        var requires = require.map(subTaskResolver);
        return func.apply({}, requires);
    }
}

module.exports = function (gulp) {
    const subTasks = {};

    function resolveSubtaskRequire(name) {
        return subTasks[name];
    }

    return function(submoduleLoader) {
        const module = submoduleLoader(gulp);
        const name = module.name;
        const tasks = module.tasks;
        for (var taskName in tasks) {
            if (tasks.hasOwnProperty(taskName)) {
                var fullyQualifiedTaskName = name + ":" + taskName;

                var taskData = tasks[taskName];

                subTasks[fullyQualifiedTaskName] = taskData.func;

                var dependencies = !taskData.dependencies ? [] : taskData.dependencies.map(function(dependency) {
                    if (dependency.indexOf(':') < 0) return name + ":" + dependency;
                    return dependency;
                });

                gulp.task(fullyQualifiedTaskName, dependencies,
                    gulpExecutor(resolveSubtaskRequire, taskData.require || [], taskData.func));
            }
        }
    };
};
