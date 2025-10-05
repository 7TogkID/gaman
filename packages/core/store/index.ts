import { Store } from '@gaman/common/index.js';

export function composeStore<A extends any[], K = string, V = any>(
	storeHandle: (...args: A) => Store<K, V>,
): (...args: A) => Store<K, V> {
	return (...args: A) => storeHandle(...args);
}
