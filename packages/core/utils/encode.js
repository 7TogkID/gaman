"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64UrlEncode = base64UrlEncode;
exports.base64UrlDecode = base64UrlDecode;
function base64UrlEncode(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
function base64UrlDecode(input) {
    input = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = input.length % 4;
    if (pad)
        input += "=".repeat(4 - pad);
    return Buffer.from(input, "base64").toString("utf8");
}
