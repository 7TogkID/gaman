/**
 * BaseRuleBuilder provides common validation logic
 * shared across all rule types (e.g., string, number, date).
 */
export class BaseRuleBuilder {
	// Each rule receives the field key and value
	protected rules: ((key: string, value: any) => string | true)[] = [];

	getRules() {
		return this.rules;
	}

	/**
	 * Marks the field as required.
	 * Fails if the value is undefined or null.
	 */
	required() {
		this.rules.push((key, val) =>
			val === undefined || val === null ? `${key} is required` : true,
		);
		return this;
	}

	/**
	 * Adds a custom validation rule.
	 * @param fn - A function that returns true if valid, or an error message.
	 */
	custom(fn: (key: string, val: any) => true | string) {
		this.rules.push(fn);
		return this;
	}
}
