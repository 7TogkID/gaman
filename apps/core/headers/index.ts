export interface IGamanHeader {
	get(key: string): string | undefined;
	set(key: string, value: string | string[]): this;
	has(key: string): boolean;
	delete(key: string): boolean;

	keys(): IterableIterator<string>;

	entries(): IterableIterator<[string, [string | string[], boolean]]>;

	toRecord(): Record<string, string>;

	toMap(): Map<string, string | string[]>;
}

export class GamanHeader {
	// [value, setted?]
	private data: Map<string, [string | string[], boolean]> = new Map();

	constructor(headers: Record<string, string | string[] | undefined> = {}) {
		for (const [key, value] of Object.entries(headers)) {
			if (value) {
				this.data.set(key.toLowerCase(), [value, false]);
			}
		}
	}

	/**
	 * Retrieves the value of a specific header by key.
	 * If the header value is an array (e.g., from multi-value headers), it will be joined into a single comma-separated string.
	 * Header keys are case-insensitive.
	 *
	 * @param key - The name of the header to retrieve.
	 * @returns The header value as a string, or undefined if not found.
	 */
	get(key: string): string | undefined {
		const k = key.toLowerCase();
		const r = this.data.get(k);
		if (!r) return undefined;
		const [value] = r;
		return Array.isArray(value) ? value.join(', ') : value;
	}

	set(key: string, value: string | string[]): this {
		this.data.set(key.toLowerCase(), [value, true]);
		return this;
	}

	has(key: string): boolean {
		const k = key.toLowerCase();
		return this.data.has(k);
	}

	delete(key: string): boolean {
		const k = key.toLowerCase();
		return this.data.delete(k);
	}

	keys(): IterableIterator<string> {
		return this.data.keys();
	}

	entries(): IterableIterator<[string, [string | string[], boolean]]> {
		return this.data.entries();
	}

	toRecord(): Record<string, string> {
		const result: Record<string, string> = {};
		for (const [key, [value]] of this.data.entries()) {
			result[key] = Array.isArray(value) ? value.join(', ') : value;
		}
		return result;
	}

	toMap(): Map<string, string | string[]> {
		const result = new Map<string, string | string[]>();
		for (const [key, [value]] of this.data.entries()) {
			result.set(key, value);
		}
		return result;
	}
}
