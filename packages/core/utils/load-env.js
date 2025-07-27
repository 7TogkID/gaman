"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const fs = require("fs");
const path = require("path");
/**
 * Loads environment variables from a .env file into process.env
 */
function loadEnv(envPath = ".env") {
    const fullPath = path.resolve(envPath);
    if (!fs.existsSync(fullPath))
        return;
    const content = fs.readFileSync(fullPath, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        // Ignore empty lines and comments
        if (!trimmed || trimmed.startsWith("#"))
            return;
        const [key, ...rest] = trimmed.split("=");
        const value = rest
            .join("=")
            .trim()
            .replace(/^["']|["']$/g, ""); // remove quotes if present
        if (key && !(key in process.env)) {
            process.env[key] = value;
        }
    });
}
