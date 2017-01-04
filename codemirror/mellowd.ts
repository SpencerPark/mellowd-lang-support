import * as CodeMirror from "codemirror";

import StringStream = CodeMirror.StringStream;

namespace MellowDCodeMirrorMode {
    interface MellowDState {
        scopeDepth: number;
        melodyDepth: number;
        chordDepth: number;
        rhythmDepth: number;
        isInMultilineComment: boolean;
    }

    const
        ERROR = 'error',
        NUMBER = 'number',
        STRING = 'string',
        BRACE = 'bracket',
        SQ_BRACKET = 'bracket',
        RND_BRACKET = 'bracket',
        ANG_BRACKET = 'bracket',
        CHORD = 'variable-2',
        NOTE = 'variable-2',
        BEAT = 'variable-2',
        ID = 'variable',
        KEYWORD = 'keyword',
        DYNAMIC = 'atom',
        DYN_GRADUAL = 'atom',
        OPERATOR = 'operator',
        ARROW = 'operator',
        ARTICULATION = 'operator',
        COMMA = 'bracket',
        COMMENT = 'comment';

    const keywords: {[key: string]: boolean} = {
        'percussion': true, 'def': true, 'block': true, 'function': true,
        'save': true, 'import': true, 'from': true, 'as': true,
        'chord': true, 'rhythm': true, 'melody': true, 'phrase': true,
        'true': true, 'on': true, 'false': true, 'off': true
    };

    const dynamics: {[key: string]: boolean} = {
        'pppp': true, 'ppp': true, 'pp': true, 'p': true,
        'mp': true, 'mf': true, 'f': true, 'ff': true,
        'fff': true, 'ffff': true
    };

    const IS_NUMBER = /[0-9]/;
    const IS_NOT_QUOTE = (c: string) => c != '"';
    const IDENTIFIER_CHARS = /^(?:[a-zA-Z0-9]|(?:_(?=[a-zA-Z0-9])))*/;

    const chordIDs: {[key: string]: boolean} = {
        'maj': true, 'm': true, 'min': true, 'aug': true,
        'dim': true, 'dim7': true, 'maj7b5': true, 'min7': true,
        'minmaj7': true, '7': true, 'dom7': true, 'maj7': true,
        'aug7': true, 'maj7s5': true, '6': true, 'maj6': true,
        'min6': true
    };

    function matchID(stream: StringStream): string {
        let capture: string[] = stream.match(IDENTIFIER_CHARS, true);

        if (!capture) return null;

        let id = capture[0];
        if (id.length == 0)
            return null;

        return id;
    }

    function chordStart(stream: StringStream): string {
        let containsIllegalIDChars: boolean = false;

        if (stream.eat('#') || stream.eat('$'))
            containsIllegalIDChars = true;

        let chordID: string = matchID(stream);

        if (stream.eat('+') || stream.eat('-')) {
            containsIllegalIDChars = true;
            if (!stream.eatWhile(/[0-9]/)) return ERROR;
        }

        if (matchID(stream)) return ERROR;

        if (!chordID || chordID === '' || chordIDs[chordID]) {
            return CHORD;
        } else {
            return containsIllegalIDChars ? ERROR : checkID(stream.current());
        }
    }

    function noteStart(stream: StringStream): string {
        let containsIllegalIDChars: boolean = false;

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
        } else {
            return NOTE;
        }
    }

    function beatStart(stream: StringStream): string {
        let containsIllegalIDChars: boolean = false;

        if (stream.eatWhile('.'))
            containsIllegalIDChars = true;

        if (matchID(stream)) {
            return containsIllegalIDChars ? ERROR : checkID(stream.current());
        } else {
            return BEAT;
        }
    }

    function lowerLetterStart(stream: StringStream, state: MellowDState): string {
        let inNoteCtx: boolean = state.melodyDepth > 0 || state.chordDepth > 0;
        let inRhythmCtx: boolean = state.rhythmDepth > 0;

        switch (stream.current()) {
            case "a":
            case "b":
            case "c":
            case "d":
            case "g":
                return noteStart(stream);
            case "e":
                if (inNoteCtx) return noteStart(stream);
                if (inRhythmCtx) return beatStart(stream);
            //noinspection FallThroughInSwitchStatementJS
            case "w":
            case "h":
            case "q":
            case "s":
            case "t":
                return beatStart(stream);
            case "f":
                //Might be a note or beat start or dynamic?
                if (inNoteCtx) return noteStart(stream);
            //noinspection FallThroughInSwitchStatementJS
            default:
                matchID(stream);
                return checkID(stream.current());
        }
    }

    function checkID(current: string): string {
        if (keywords[current]) return KEYWORD;
        if (dynamics[current]) return DYNAMIC;
        return ID;
    }

    function token(stream: StringStream, state: MellowDState): string {
        //This is the most common so check it first and get rid of it quickly
        if (stream.eatSpace()) return null;

        if (state.isInMultilineComment) {
            if (stream.match(/^(?:[^*]|\*(?!\/))*\*\//, true)) {
                state.isInMultilineComment = false;
                return COMMENT;
            }
            stream.skipToEnd();
            return COMMENT;
        }

        let next = stream.next();

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
                if (state.scopeDepth == 0) return ERROR;
                state.scopeDepth--;
                return BRACE;
            case "[":
                state.melodyDepth++;
                return SQ_BRACKET;
            case "]":
                if (state.melodyDepth == 0) return ERROR;
                state.melodyDepth--;
                return SQ_BRACKET;
            case "(":
                state.chordDepth++;
                return RND_BRACKET;
            case ")":
                if (state.chordDepth == 0) return ERROR;
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
                if (stream.eatWhile(IS_NUMBER)) return NUMBER;
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
            } else if (stream.eat('*')) {
                state.isInMultilineComment = true;
                stream.match(/^(?:[^*]|\*(?!\/))*/, true);
                return COMMENT;
            }
            return ERROR;
        }

        stream.next();
        return null;
    }

    CodeMirror.defineMode('mellowd', (config: CodeMirror.EditorConfiguration): CodeMirror.Mode<MellowDState> => {
        return {
            token: token,
            startState: (): MellowDState => ({
                scopeDepth: 0,
                melodyDepth: 0,
                chordDepth: 0,
                rhythmDepth: 0,
                isInMultilineComment: false
            }),
            copyState: (state: MellowDState): MellowDState => ({
                scopeDepth: state.scopeDepth,
                melodyDepth: state.melodyDepth,
                chordDepth: state.chordDepth,
                rhythmDepth: state.rhythmDepth,
                isInMultilineComment: state.isInMultilineComment
            }),

            lineComment: '//',
            blockCommentStart: '/*',
            blockCommentEnd: '*/',
            blockCommentLead: '* ',

            electricinput: /\{/
        };
    });

    CodeMirror['defineMIME']("text/x-mellowd", "mellowd");
}