import { Blob, BlobOptions } from 'node:buffer';
import { BinaryLike } from 'node:crypto';
/**
 * GamanJS-compatible File class, extending Blob
 */
export declare class File extends Blob {
    filename: string;
    lastModified: number;
    private _type;
    constructor(filename: string, sources: Array<ArrayBuffer | BinaryLike | Blob>, options?: BlobOptions & {
        lastModified?: number;
    });
    get [Symbol.toStringTag](): string;
    /**
     * Saves the file to a given path
     * @param path string - output path
     */
    saveTo(path: string): Promise<void>;
    /**
     * Returns the file extension (e.g. "png", "txt")
     */
    get extension(): string;
    /**
     * Returns the MIME type of the file
     */
    get mimeType(): string;
    /**
     * Returns the file size in kilobytes
     */
    get sizeInKB(): string;
    /**
     * Returns the file size in megabytes
     */
    get sizeInMB(): string;
    /**
     * Checks if the file is of a certain MIME type
     */
    isType(expected: string | RegExp): boolean;
    /**
     * Checks if the file has one of the specified extensions
     */
    hasExtension(...exts: string[]): boolean;
    /**
     * Saves the file to a temporary path and returns it
     */
    saveTemp(prefix?: string): Promise<string>;
    /**
     * Returns a short summary string
     */
    toString(): string;
    /**
     * Returns file metadata as JSON
     */
    toJSON(): {
        name: string;
        size: number;
        type: string;
        lastModified: number;
    };
}
