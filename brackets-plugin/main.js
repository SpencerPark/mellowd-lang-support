define(function (require, exports, module) {
    "use strict";
    require('mode/mellowd');

    const LanguageManager = brackets.getModule("language/LanguageManager"),
               CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");

    LanguageManager.defineLanguage("mellowd", {
        name: "MellowD",
        mode: "mellowd",
        fileExtensions: ["mlod"],
        blockComment: ["/*", "*/"],
        lineComment: ["//"]
    }).done(function (lang) {
        console.log("Created " + lang.getName() + ".");
    });
});