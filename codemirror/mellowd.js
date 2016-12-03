///<reference types="codemirror"/>
var MellowDCodeMirrorMode;
(function (MellowDCodeMirrorMode) {
    var ERROR = 'error', NUMBER = 'number', STRING = 'string', BRACE = 'bracket', SQ_BRACKET = 'bracket', RND_BRACKET = 'bracket', ANG_BRACKET = 'bracket', CHORD = 'variable-2', NOTE = 'variable-2', BEAT = 'variable-2', ID = 'variable', KEYWORD = 'keyword', DYNAMIC = 'atom', DYN_GRADUAL = 'atom', OPERATOR = 'operator', ARROW = 'operator', ARTICULATION = 'operator', COMMA = 'bracket', COMMENT = 'comment';
    var keywords = {
        'percussion': true, 'def': true, 'block': true, 'function': true,
        'save': true, 'import': true, 'from': true, 'as': true,
        'chord': true, 'rhythm': true, 'melody': true, 'phrase': true,
        'true': true, 'on': true, 'false': true, 'off': true
    };
    var dynamics = {
        'pppp': true, 'ppp': true, 'pp': true, 'p': true,
        'mp': true, 'mf': true, 'f': true, 'ff': true,
        'fff': true, 'ffff': true
    };
    var IS_NUMBER = /[0-9]/;
    var IS_NOT_QUOTE = function (c) { return c != '"'; };
    var IDENTIFIER_CHARS = /^(?:[a-zA-Z0-9]|(?:_(?=[a-zA-Z0-9])))*/;
    var chordIDs = {
        'maj': true, 'm': true, 'min': true, 'aug': true,
        'dim': true, 'dim7': true, 'maj7b5': true, 'min7': true,
        'minmaj7': true, '7': true, 'dom7': true, 'maj7': true,
        'aug7': true, 'maj7s5': true, '6': true, 'maj6': true,
        'min6': true
    };
    var matchID = function (stream) {
        var capture = stream.match(IDENTIFIER_CHARS, true);
        if (!capture)
            return null;
        var id = capture[0];
        if (id.length == 0)
            return null;
        return id;
    };
    var chordStart = function (stream) {
        var containsIllegalIDChars = false;
        if (stream.eat('#') || stream.eat('$'))
            containsIllegalIDChars = true;
        var chordID = matchID(stream);
        if (stream.eat('+') || stream.eat('-')) {
            containsIllegalIDChars = true;
            if (!stream.eatWhile(/[0-9]/))
                return ERROR;
        }
        if (matchID(stream))
            return ERROR;
        if (chordIDs[chordID]) {
            return CHORD;
        }
        else {
            return containsIllegalIDChars ? ERROR : checkID(stream.current());
        }
    };
    var noteStart = function (stream) {
        var containsIllegalIDChars = false;
        if (stream.eat('#') || stream.eat('$'))
            containsIllegalIDChars = true;
        if (stream.eat('+') || stream.eat('-')) {
            containsIllegalIDChars = true;
            if (!stream.eatWhile(/[0-9]/)) {
                return ERROR;
            }
        }
        if (matchID(stream)) {
            return containsIllegalIDChars ? ERROR : checkID(stream.current());
        }
        else {
            return NOTE;
        }
    };
    var beatStart = function (stream) {
        var containsIllegalIDChars = false;
        if (stream.eatWhile('.'))
            containsIllegalIDChars = true;
        if (matchID(stream)) {
            return containsIllegalIDChars ? ERROR : checkID(stream.current());
        }
        else {
            return BEAT;
        }
    };
    function lowerLetterStart(stream, state) {
        var inNoteCtx = state.melodyDepth > 0 || state.chordDepth > 0;
        var inRhythmCtx = state.rhythmDepth > 0;
        switch (stream.current()) {
            case "a":
            case "b":
            case "c":
            case "d":
            case "g":
                return noteStart(stream);
            case "e":
                if (inNoteCtx)
                    return noteStart(stream);
                if (inRhythmCtx)
                    return beatStart(stream);
            //noinspection FallThroughInSwitchStatementJS
            case "w":
            case "h":
            case "q":
            case "s":
            case "t":
                return beatStart(stream);
            case "f":
                //Might be a note or beat start or dynamic?
                if (inNoteCtx)
                    return noteStart(stream);
            //noinspection FallThroughInSwitchStatementJS
            default:
                matchID(stream);
                return checkID(stream.current());
        }
    }
    ;
    var checkID = function (current) {
        if (keywords[current])
            return KEYWORD;
        if (dynamics[current])
            return DYNAMIC;
        return ID;
    };
    var token = function (stream, state) {
        //This is the most common so check it first and get rid of it quickly
        if (stream.eatSpace())
            return null;
        if (state.isInMultilineComment) {
            if (stream.match(/^(?:[^*]|\*(?!\/))*\*\//, true)) {
                state.isInMultilineComment = false;
                return COMMENT;
            }
            stream.skipToEnd();
            return COMMENT;
        }
        var next = stream.next();
        if (/[0-9]/.test(next)) {
            stream.eatWhile(IS_NUMBER);
            return NUMBER;
        }
        switch (next) {
            case '"':
                stream.eatWhile(IS_NOT_QUOTE);
                return stream.eat('"') ? STRING : ERROR;
            case "{":
                state.scopeDepth++;
                return BRACE;
            case "}":
                if (state.scopeDepth == 0)
                    return ERROR;
                state.scopeDepth--;
                return BRACE;
            case "[":
                state.melodyDepth++;
                return SQ_BRACKET;
            case "]":
                if (state.melodyDepth == 0)
                    return ERROR;
                state.melodyDepth--;
                return SQ_BRACKET;
            case "(":
                state.chordDepth++;
                return RND_BRACKET;
            case ")":
                if (state.chordDepth == 0)
                    return ERROR;
                state.chordDepth--;
                return RND_BRACKET;
            case "<":
                if (state.scopeDepth > 0 && stream.eat('<'))
                    return DYN_GRADUAL;
                state.rhythmDepth++;
                return ANG_BRACKET;
            case ">":
                if (state.scopeDepth > 0 && stream.eat('>'))
                    return DYN_GRADUAL;
                state.rhythmDepth--;
                return ANG_BRACKET;
            case "*":
            case ":":
            case "?":
                return OPERATOR;
            case "+":
                return stream.eatWhile(IS_NUMBER) ? NUMBER : ERROR;
            case "-":
                if (stream.eatWhile(IS_NUMBER))
                    return NUMBER;
            //noinspection FallThroughInSwitchStatementJS
            case "=":
                return stream.eat('>') ? ARROW : ERROR;
        }
        if (/[a-z]/.test(next))
            return lowerLetterStart(stream, state);
        if (/[A-G]/.test(next))
            return chordStart(stream);
        if (/[H-Z]/.test(next)) {
            matchID(stream);
            return ID;
        }
        if (/[.!_~^`]/.test(next))
            return ARTICULATION;
        if (next == ',')
            return COMMA;
        if (next == '/') {
            if (stream.eat('/')) {
                stream.skipToEnd();
                return COMMENT;
            }
            else if (stream.eat('*')) {
                state.isInMultilineComment = true;
                stream.match(/^(?:[^*]|\*(?!\/))*/, true);
                return COMMENT;
            }
            return ERROR;
        }
        stream.next();
        return null;
    };
    CodeMirror.defineMode('mellowd', function (config) {
        return {
            token: token,
            startState: function () { return ({
                scopeDepth: 0,
                melodyDepth: 0,
                chordDepth: 0,
                rhythmDepth: 0,
                isInMultilineComment: false
            }); },
            copyState: function (state) { return ({
                scopeDepth: state.scopeDepth,
                melodyDepth: state.melodyDepth,
                chordDepth: state.chordDepth,
                rhythmDepth: state.rhythmDepth,
                isInMultilineComment: state.isInMultilineComment
            }); },
            lineComment: '//',
            blockCommentStart: '/*',
            blockCommentEnd: '*/',
            blockCommentLead: '* ',
            electricinput: /\{/
        };
    });
    CodeMirror['defineMIME']("text/x-mellowd", "mellowd");
})(MellowDCodeMirrorMode || (MellowDCodeMirrorMode = {}));
//# sourceMappingURL=mellowd.js.map