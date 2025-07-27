"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = parseArgs;
exports.parsePath = parsePath;
exports.removeStart = removeStart;
exports.removeEnd = removeEnd;
const _path = require("path");
function parseArgs(argv = process.argv.slice(2)) {
    const args = {};
    let command = argv[0];
    for (let i = 1; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split("=");
            args[key] = value ?? true;
        }
        else {
            args._ = args._ || [];
            args._.push(arg);
        }
    }
    return { command, args };
}
function parsePath(pathName) {
    pathName = removeStart(pathName, "./");
    // Hilangkan ekstensi file (".ts", ".js", ".block.ts", dll)
    if (pathName.includes(".")) {
        pathName = pathName.split(".")[0];
    }
    const segments = pathName.split("/");
    const name = segments.pop(); // ambil nama terakhir
    const dirPath = _path.normalize(segments.join("/")); // sisa direktori
    return {
        path: _path.normalize(pathName), // full path tanpa ekstensi, misal: "blocks/user/index"
        dirPath, // misal: "blocks/user"
        name // misal: "index"
    };
}
function removeStart(str, prefix) {
    return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}
function removeEnd(str, suffix) {
    return str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
}
