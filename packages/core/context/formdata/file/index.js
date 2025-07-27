import { Blob } from 'node:buffer';
import { detectMime } from '../../../utils/mime';
/**
 * GamanJS-compatible File class, extending Blob
 */
export class File extends Blob {
    constructor(filename, sources, options) {
        const mimeType = options?.type || detectMime(filename) || '';
        super(sources, { ...options, type: mimeType });
        this.filename = filename;
        this.lastModified = options?.lastModified ?? Date.now();
        this._type = mimeType;
    }
    get [Symbol.toStringTag]() {
        return 'File';
    }
    /**
     * Saves the file to a given path
     * @param path string - output path
     */
    async saveTo(path) {
        const { writeFile } = await import('node:fs/promises');
        await writeFile(path, Buffer.from(await this.arrayBuffer()));
    }
    /**
     * Returns the file extension (e.g. "png", "txt")
     */
    get extension() {
        const parts = this.filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }
    /**
     * Returns the MIME type of the file
     */
    get mimeType() {
        return this._type || detectMime(this.filename) || '';
    }
    /**
     * Returns the file size in kilobytes
     */
    get sizeInKB() {
        return (this.size / 1024).toFixed(2) + ' KB';
    }
    /**
     * Returns the file size in megabytes
     */
    get sizeInMB() {
        return (this.size / (1024 * 1024)).toFixed(2) + ' MB';
    }
    /**
     * Checks if the file is of a certain MIME type
     */
    isType(expected) {
        if (expected instanceof RegExp)
            return expected.test(this.mimeType);
        return this.mimeType === expected;
    }
    /**
     * Checks if the file has one of the specified extensions
     */
    hasExtension(...exts) {
        return exts.includes(this.extension);
    }
    /**
     * Saves the file to a temporary path and returns it
     */
    async saveTemp(prefix = 'file_') {
        const { writeFile } = await import('node:fs/promises');
        const { tmpdir } = await import('node:os');
        const { join } = await import('node:path');
        const name = `${prefix}${Date.now()}_${this.filename}`;
        const fullPath = join(tmpdir(), name);
        console.log(fullPath);
        await writeFile(fullPath, Buffer.from(await this.arrayBuffer()));
        return fullPath;
    }
    /**
     * Returns a short summary string
     */
    toString() {
        return `[File ${this.filename} | ${this.mimeType} | ${this.size} bytes]`;
    }
    /**
     * Returns file metadata as JSON
     */
    toJSON() {
        return {
            name: this.filename,
            size: this.size,
            type: this.mimeType,
            lastModified: this.lastModified,
        };
    }
}
