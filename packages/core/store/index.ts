import { Store } from "@gaman/common/index.js";

export function composeStore<K = string, V = any>(
	store: Store<K, V>,
): Store<K, V> {
	return store;
}