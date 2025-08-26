import { BaseRuleBuilder } from './builder';
/**
 * RuleString extends BaseRuleBuilder and provides
 * a set of string-specific validation methods.
 */
export declare class RuleString extends BaseRuleBuilder {
    /**
     * Validates that the value is a string.
     */
    string(): this;
    /**
     * Ensures the string is not empty after trimming.
     */
    notEmpty(): this;
    /**
     * Ensures the string has at least `n` characters.
     * @param n - Minimum length
     */
    min(n: number): this;
    /**
     * Ensures the string has at most `n` characters.
     * @param n - Maximum length
     */
    max(n: number): this;
    /**
     * Ensures the string has exactly `n` characters.
     * @param n - Exact length
     */
    length(n: number): this;
    /**
     * Validates the string against a regular expression.
     * @param regex - The pattern to test
     * @param message - Custom error message (default: 'Invalid format')
     */
    pattern(regex: RegExp, message?: string): this;
    /**
     * Validates the string as a proper email format.
     */
    email(): this;
    /**
     * Ensures the string starts with the specified prefix.
     * @param prefix - Required prefix
     */
    startsWith(prefix: string): this;
    /**
     * Ensures the string ends with the specified suffix.
     * @param suffix - Required suffix
     */
    endsWith(suffix: string): this;
    /**
     * Ensures the string includes the specified substring.
     * @param str - Required substring
     */
    includes(str: string): this;
    /**
     * Ensures the string has no leading or trailing whitespace.
     */
    trimmed(): this;
}
