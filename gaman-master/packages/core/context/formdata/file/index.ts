import { Blob, BlobOptions } from 'node:buffer';
import { detectMime } from '@gaman/common/utils/mime.js';
import { BinaryLike } from 'node:crypto';

/**
 * GamanJS-compatible File class, extending Blob
 */
export class File extends Blob {
	filename: string;
	lastModified: number;
	private _type: string;

	constructor(
    filename: string,
		sources: Array<ArrayBuffer | BinaryLike | Blob>,
		options?: BlobOptions & { lastModified?: number },
	) {
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
	async saveTo(path: string) {
		const { writeFile } = await import('node:fs/promises');
		await writeFile(path, Buffer.from(await this.arrayBuffer()));
	}

	/**
	 * Returns the file extension (e.g. "png", "txt")
	 */
	get extension(): string {
		const parts = this.filename.split('.');
		return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
	}

	/**
	 * Returns the MIME type of the file
	 */
	get mimeType(): string {
		return this._type || detectMime(this.filename) || '';
	}

	/**
	 * Returns the file size in kilobytes
	 */
	get sizeInKB(): string {
		return (this.size / 1024).toFixed(2) + ' KB';
	}

	/**
	 * Returns the file size in megabytes
	 */
	get sizeInMB(): string {
		return (this.size / (1024 * 1024)).toFixed(2) + ' MB';
	}

	/**
	 * Checks if the file is of a certain MIME type
	 */
	isType(expected: string | RegExp): boolean {
		if (expected instanceof RegExp) return expected.test(this.mimeType);
		return this.mimeType === expected;
	}

	/**
	 * Checks if the file has one of the specified extensions
	 */
	hasExtension(...exts: string[]): boolean {
		return exts.includes(this.extension);
	}

	/**
	 * Saves the file to a temporary path and returns it
	 */
	async saveTemp(prefix = 'file_'): Promise<string> {
		const { writeFile } = await import('node:fs/promises');
		const { tmpdir } = await import('node:os');
		const { join } = await import('node:path');
		const name = `${prefix}${Date.now()}_${this.filename}`;
		const fullPath = join(tmpdir(), name);
		await writeFile(fullPath, Buffer.from(await this.arrayBuffer()));
		return fullPath;
	}

	/**
	 * Returns a short summary string
	 */
	toString(): string {
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
