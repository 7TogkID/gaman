import { Priority } from '@gaman/common/enums/priority.enum.js';
import { Middleware } from '@gaman/common/types/middleware.types.js';
import { sortArrayByPriority } from '../utils/priority.js';

const middlewares: Array<Middleware> = [];
const monitorMiddlewares: Array<Middleware> = [];
function register(...mws: Middleware[]) {
	for (const mw of mws) {
		if (mw.config.priority === Priority.MONITOR) {
			monitorMiddlewares.push(mw);
		} else {
			insertAndSort(middlewares, mw, (mw) => mw.config.priority);
		}
	}
}

function getMiddlewares(): Array<Middleware> {
	return middlewares;
}
function getMonitorMiddlewares(): Array<Middleware> {
	return monitorMiddlewares;
}

/**
 * Insert item to an array and keep it sorted by priority.
 *
 * @param arr - Target array (will be mutated in place).
 * @param item - Item to insert.
 * @param selector - A key of T OR a function that returns a Priority string.
 * @param order - 'asc' | 'desc'. Default: 'asc'.
 */
export function insertAndSort<T>(
	arr: T[],
	item: T,
	selector: keyof T | ((item: T) => Priority | undefined),
	order: 'asc' | 'desc' = 'asc',
): void {
	arr.push(item);

	// ? pakai sortArrayByPriority, lalu replace isi array supaya reference tetap sama
	const sorted = sortArrayByPriority(arr, selector, order);
	arr.length = 0;
	arr.push(...sorted);
}

export default {
	register,
	getMiddlewares,
	getMonitorMiddlewares,
};
