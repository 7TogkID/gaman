"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStore = void 0;
const fs = require("node:fs/promises");
const path = require("node:path");
class FileStore {
    constructor(dir = './sessions') {
        this.dir = dir;
        fs.mkdir(this.dir, { recursive: true }).catch(() => { });
    }
    getFilePath(key) {
        return path.join(this.dir, `${key}.json`);
    }
    async get(key) {
        try {
            const filePath = this.getFilePath(key);
            const content = await fs.readFile(filePath, 'utf-8');
            const { value, expiresAt } = JSON.parse(content);
            if (Date.now() > expiresAt) {
                await this.delete(key);
                return null;
            }
            return value;
        }
        catch {
            return null;
        }
    }
    async set(key, value, maxAge = 86400) {
        const filePath = this.getFilePath(key);
        const expiresAt = Date.now() + maxAge * 1000;
        const data = JSON.stringify({ value, expiresAt });
        await fs.writeFile(filePath, data, 'utf-8');
    }
    async has(key) {
        const value = await this.get(key);
        return value !== null;
    }
    async delete(key) {
        const filePath = this.getFilePath(key);
        await fs.rm(filePath, { force: true });
    }
}
exports.FileStore = FileStore;
