"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priorityToNumber = priorityToNumber;
exports.sortArrayByPriority = sortArrayByPriority;
/**
 * Converts a priority level to a corresponding numeric value.
 *
 * @param priority - The priority level as a string.
 * @returns A number representing the priority level (1 = highest priority).
 */
function priorityToNumber(priority) {
    const priorityMap = {
        "very-high": 1,
        high: 2,
        normal: 3,
        low: 4,
        "very-low": 5,
    };
    return priorityMap[priority || "normal"];
}
/**
 * Sorts an array of objects based on their priority.
 *
 * @param array - The array to sort.
 * @param key - The key representing the priority in the objects.
 * @param order - Sorting order: 'asc' (ascending) or 'desc' (descending). Default is 'asc'.
 * @returns A sorted array.
 */
function sortArrayByPriority(array, key, order = "asc") {
    const priorityMap = {
        "very-high": 1,
        high: 2,
        normal: 3,
        low: 4,
        "very-low": 5,
    };
    return [...array].sort((a, b) => {
        const aPriority = priorityMap[a[key] || "normal"] || Number.MAX_VALUE;
        const bPriority = priorityMap[b[key] || "normal"] || Number.MAX_VALUE;
        const comparison = aPriority - bPriority;
        return order === "asc" ? comparison : -comparison;
    });
}
