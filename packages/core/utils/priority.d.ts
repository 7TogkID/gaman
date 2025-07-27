import type { Priority } from "../types";
/**
 * Converts a priority level to a corresponding numeric value.
 *
 * @param priority - The priority level as a string.
 * @returns A number representing the priority level (1 = highest priority).
 */
export declare function priorityToNumber(priority?: Priority): number;
/**
 * Sorts an array of objects based on their priority.
 *
 * @param array - The array to sort.
 * @param key - The key representing the priority in the objects.
 * @param order - Sorting order: 'asc' (ascending) or 'desc' (descending). Default is 'asc'.
 * @returns A sorted array.
 */
export declare function sortArrayByPriority<T>(array: T[], key: keyof T, order?: "asc" | "desc"): T[];
