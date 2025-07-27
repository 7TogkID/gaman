"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFormat = void 0;
exports.TextFormat = {
    // Styles
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m',
    DIM: '\x1b[2m',
    UNDERLINE: '\x1b[4m',
    BLINK: '\x1b[5m',
    REVERSE: '\x1b[7m',
    HIDDEN: '\x1b[8m',
    ITALIC: '\x1b[3m',
    STRIKETHROUGH: '\x1b[9m',
    // Foreground colors
    BLACK: '\x1b[30m',
    BLUE: '\x1b[34m',
    GREEN: '\x1b[32m',
    CYAN: '\x1b[36m',
    RED: '\x1b[31m',
    MAGENTA: '\x1b[35m',
    YELLOW: '\x1b[33m',
    WHITE: '\x1b[37m',
    GRAY: '\x1b[90m',
    LIGHT_BLUE: '\x1b[38;5;117m',
    LIGHT_GREEN: '\x1b[38;5;120m',
    LIGHT_RED: '\x1b[38;5;203m',
    LIGHT_PURPLE: '\x1b[38;5;177m',
    LIGHT_YELLOW: '\x1b[38;5;228m',
    BRIGHT_WHITE: '\x1b[38;5;255m',
    // Background colors
    BG_BLACK: '\x1b[40m',
    BG_BLUE: '\x1b[44m',
    BG_GREEN: '\x1b[42m',
    BG_CYAN: '\x1b[46m',
    BG_RED: '\x1b[41m',
    BG_MAGENTA: '\x1b[45m',
    BG_YELLOW: '\x1b[43m',
    BG_WHITE: '\x1b[47m',
    BG_GRAY: '\x1b[100m',
    BG_LIGHT_BLUE: '\x1b[48;5;117m',
    BG_LIGHT_GREEN: '\x1b[48;5;120m',
    BG_LIGHT_RED: '\x1b[48;5;203m',
    BG_LIGHT_PURPLE: '\x1b[48;5;177m',
    BG_LIGHT_YELLOW: '\x1b[48;5;228m',
    BG_BRIGHT_WHITE: '\x1b[48;5;255m',
    format(text) {
        const fgMap = {
            '0': exports.TextFormat.BLACK,
            '1': exports.TextFormat.BLUE,
            '2': exports.TextFormat.GREEN,
            '3': exports.TextFormat.CYAN,
            '4': exports.TextFormat.RED,
            '5': exports.TextFormat.MAGENTA,
            '6': exports.TextFormat.YELLOW,
            '7': exports.TextFormat.WHITE,
            '8': exports.TextFormat.GRAY,
            '9': exports.TextFormat.LIGHT_BLUE,
            a: exports.TextFormat.LIGHT_GREEN,
            b: exports.TextFormat.CYAN,
            c: exports.TextFormat.LIGHT_RED,
            d: exports.TextFormat.LIGHT_PURPLE,
            e: exports.TextFormat.LIGHT_YELLOW,
            f: exports.TextFormat.BRIGHT_WHITE,
        };
        const bgMap = {
            '0': exports.TextFormat.BG_BLACK,
            '1': exports.TextFormat.BG_BLUE,
            '2': exports.TextFormat.BG_GREEN,
            '3': exports.TextFormat.BG_CYAN,
            '4': exports.TextFormat.BG_RED,
            '5': exports.TextFormat.BG_MAGENTA,
            '6': exports.TextFormat.BG_YELLOW,
            '7': exports.TextFormat.BG_WHITE,
            '8': exports.TextFormat.BG_GRAY,
            '9': exports.TextFormat.BG_LIGHT_BLUE,
            a: exports.TextFormat.BG_LIGHT_GREEN,
            b: exports.TextFormat.BG_CYAN,
            c: exports.TextFormat.BG_LIGHT_RED,
            d: exports.TextFormat.BG_LIGHT_PURPLE,
            e: exports.TextFormat.BG_LIGHT_YELLOW,
            f: exports.TextFormat.BG_BRIGHT_WHITE,
        };
        const styleMap = {
            l: exports.TextFormat.BOLD,
            n: exports.TextFormat.UNDERLINE,
            o: exports.TextFormat.ITALIC,
            m: exports.TextFormat.STRIKETHROUGH,
            k: '', // Obfuscated: tidak didukung
            r: exports.TextFormat.RESET,
        };
        return (text
            // Background: §bX
            .replace(/§b([0-9a-f])/gi, (_, c) => bgMap[c.toLowerCase()] ?? '')
            // Foreground: §X
            .replace(/§([0-9a-f])/gi, (_, c) => fgMap[c.toLowerCase()] ?? '')
            // Style: §l §n §o §m §r
            .replace(/§([lnomkr])/gi, (_, c) => styleMap[c.toLowerCase()] ?? ''));
    },
};
