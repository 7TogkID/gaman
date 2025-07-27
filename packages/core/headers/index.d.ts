export declare class GamanHeaders {
    #private;
    constructor(headers?: Record<string, string | string[] | undefined>);
    /**
     * Retrieves the value of a specific header by key.
     * If the header value is an array (e.g., from multi-value headers), it will be joined into a single comma-separated string.
     * Header keys are case-insensitive.
     *
     * @param key - The name of the header to retrieve.
     * @returns The header value as a string, or undefined if not found.
     */
    get(key: string): string | undefined;
    set(key: string, value: string | string[]): this;
    has(key: string): boolean;
    delete(key: string): boolean;
    keys(): MapIterator<string>;
    entries(): MapIterator<[string, string | string[]]>;
    toRecord(): Record<string, string>;
    toMap(): Map<string, string | string[]>;
}
