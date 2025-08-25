export type Priority = "very-high" | "high" | "normal" | "low" | "very-low";

const priorityMap: Record<Priority, number> = {
  "very-high": 1,
  high: 2,
  normal: 3,
  low: 4,
  "very-low": 5,
};

/**
 * Sort array by priority using key or custom selector function.
 *
 * @param array - The array to sort.
 * @param selector - A key of T OR a function that returns a Priority string.
 * @param order - 'asc' | 'desc'. Default: 'asc'.
 */
export function sortArrayByPriority<T>(
  array: T[],
  selector: keyof T | ((item: T) => Priority | undefined),
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aPriority =
      typeof selector === "function"
        ? selector(a)
        : (a[selector] as Priority) || "normal";
    const bPriority =
      typeof selector === "function"
        ? selector(b)
        : (b[selector] as Priority) || "normal";

    const aValue = priorityMap[aPriority!] || Number.MAX_VALUE;
    const bValue = priorityMap[bPriority!] || Number.MAX_VALUE;

    const comparison = aValue - bValue;

    return order === "asc" ? comparison : -comparison;
  });
}
