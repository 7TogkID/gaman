/**
 * BaseRuleBuilder provides common validation logic
 * shared across all rule types (e.g., string, number, date).
 */
export declare class BaseRuleBuilder {
    protected rules: ((key: string, value: any) => string | true)[];
    getRules(): ((key: string, value: any) => string | true)[];
    /**
     * Marks the field as required.
     * Fails if the value is undefined or null.
     */
    required(): this;
    /**
     * Adds a custom validation rule.
     * @param fn - A function that returns true if valid, or an error message.
     */
    custom(fn: (key: string, val: any) => true | string): this;
}
