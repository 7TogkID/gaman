export class GamanHeaders {
  #data: Map<string, string | string[]> = new Map();

  constructor(
    headers: Record<string, string | string[] | undefined> = {}
  ) {
    for (const [key, value] of Object.entries(headers)) {
      this.#data.set(key.toLowerCase(), value);
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
    const r = this.#data.get(k);
    return Array.isArray(r) ? r.join(", ") : r;
  }

  set(key: string, value: string | string[]): this {
    this.#data.set(key.toLowerCase(), value);
    return this;
  }

  has(key: string): boolean {
    const k = key.toLowerCase();
    return this.#data.has(k);
  }

  delete(key: string): boolean {
    const k = key.toLowerCase();
    if (!this.#data.has(k)) return false;
    this.#data.delete(k);
    return true;
  }

  keys(): MapIterator<string> {
    return this.#data.keys();
  }

  entries(): MapIterator<[string, string | string[]]> {
    return this.#data.entries();
  }

  toRecord(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of this.entries()) {
      result[key] = Array.isArray(value) ? value.join(", ") : value;
    }
    return result;
  }

  toMap(): Map<string, string | string[]> {
    return this.#data;
  }
}
