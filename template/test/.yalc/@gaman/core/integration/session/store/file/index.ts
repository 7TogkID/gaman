import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { IGamanSessionStore } from '..';

export class FileStore implements IGamanSessionStore {
	private dir: string;

	constructor(dir: string = './sessions') {
		this.dir = dir;
		fs.mkdir(this.dir, { recursive: true }).catch(() => {});
	}

	private getFilePath(key: string) {
		return path.join(this.dir, `${key}.json`);
	}

	async get(key: string): Promise<string | null> {
		try {
			const filePath = this.getFilePath(key);
			const content = await fs.readFile(filePath, 'utf-8');
			const { value, expiresAt } = JSON.parse(content);

			if (Date.now() > expiresAt) {
				await this.delete(key);
				return null;
			}

			return value;
		} catch {
			return null;
		}
	}

	async set(key: string, value: string, maxAge: number = 86400): Promise<void> {
		const filePath = this.getFilePath(key);
		const expiresAt = Date.now() + maxAge * 1000;
		const data = JSON.stringify({ value, expiresAt });
		await fs.writeFile(filePath, data, 'utf-8');
	}

	async has(key: string): Promise<boolean> {
		const value = await this.get(key);
		return value !== null;
	}

	async delete(key: string): Promise<void> {
		const filePath = this.getFilePath(key);
		await fs.rm(filePath, { force: true });
	}
}
