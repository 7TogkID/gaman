export interface Store<K = string, V = any> {
	get(key: K): V | Promise<V>;
	set(key: K, value: V, ttl?: number): void | Promise<void>;
	has(key: K): boolean | Promise<boolean>;
	delete(key: K): void | Promise<void>;
	clear?(): void | Promise<void>;
}
