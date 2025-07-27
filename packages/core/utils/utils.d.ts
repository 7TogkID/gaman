/**
 * ! strict bisa di ganti true cuman saat register block aja
 * @param path
 * @param strict
 * @returns
 */
export declare function formatPath(path: string, strict?: boolean): string;
export declare function removeEndSlash(s: string): string;
/**
 * Validates if a string contains valid HTML.
 * @param str - The string to validate.
 * @returns True if the string is HTML, otherwise false.
 */
export declare function isHtmlString(str: string): boolean;
/**
 * Sorts an array of objects based on a specified key.
 *
 * @param array - The array to sort.
 * @param key - The key to sort by.
 * @param order - Sorting order: 'asc' (ascending) or 'desc' (descending). Default is 'asc'.
 * @returns A sorted array.
 */
export declare function sortArray<T>(array: T[], key: keyof T, order?: 'asc' | 'desc'): T[];
export declare function parseBoolean(value: string): boolean;
export declare function parseExpires(expires: string | number): Date;
