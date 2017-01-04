define(function (require, exports, module) {
    "use strict";

    const LanguageManager = brackets.getModule("language/LanguageManager"),
        CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");

    require('mode/mellowd');

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