import { BaseRuleBuilder } from './builder';
/**
 * RuleString extends BaseRuleBuilder and provides
 * a set of string-specific validation methods.
 */
export class RuleString extends BaseRuleBuilder {
    /**
     * Validates that the value is a string.
     */
    string() {
        this.rules.push((key, val) => typeof val === 'string' ? true : `${key} must be a string`);
        return this;
    }
    /**
     * Ensures the string is not empty after trimming.
     */
    notEmpty() {
        this.rules.push((key, val) => typeof val === 'string' && val.trim() === ''
            ? `${key} must not be empty`
            : true);
        return this;
    }
    /**
     * Ensures the string has at least `n` characters.
     * @param n - Minimum length
     */
    min(n) {
        this.rules.push((key, val) => typeof val === 'string' && val.length >= n
            ? true
            : `${key} must be at least ${n} characters long`);
        return this;
    }
    /**
     * Ensures the string has at most `n` characters.
     * @param n - Maximum length
     */
    max(n) {
        this.rules.push((key, val) => typeof val === 'string' && val.length <= n
            ? true
            : `${key} must be at most ${n} characters long`);
        return this;
    }
    /**
     * Ensures the string has exactly `n` characters.
     * @param n - Exact length
     */
    length(n) {
        this.rules.push((key, val) => typeof val === 'string' && val.length === n
            ? true
            : `${key} must be exactly ${n} characters long`);
        return this;
    }
    /**
     * Validates the string against a regular expression.
     * @param regex - The pattern to test
     * @param message - Custom error message (default: 'Invalid format')
     */
    pattern(regex, message = 'Invalid format') {
        this.rules.push((key, val) => typeof val === 'string' && regex.test(val)
            ? true
            : `${key}: ${message}`);
        return this;
    }
    /**
     * Validates the string as a proper email format.
     */
    email() {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.rules.push((key, val) => typeof val === 'string' && regex.test(val)
            ? true
            : `${key} must be a valid email address`);
        return this;
    }
    /**
     * Ensures the string starts with the specified prefix.
     * @param prefix - Required prefix
     */
    startsWith(prefix) {
        this.rules.push((key, val) => typeof val === 'string' && val.startsWith(prefix)
            ? true
            : `${key} must start with "${prefix}"`);
        return this;
    }
    /**
     * Ensures the string ends with the specified suffix.
     * @param suffix - Required suffix
     */
    endsWith(suffix) {
        this.rules.push((key, val) => typeof val === 'string' && val.endsWith(suffix)
            ? true
            : `${key} must end with "${suffix}"`);
        return this;
    }
    /**
     * Ensures the string includes the specified substring.
     * @param str - Required substring
     */
    includes(str) {
        this.rules.push((key, val) => typeof val === 'string' && val.includes(str)
            ? true
            : `${key} must include "${str}"`);
        return this;
    }
    /**
     * Ensures the string has no leading or trailing whitespace.
     */
    trimmed() {
        this.rules.push((key, val) => typeof val === 'string' && val === val.trim()
            ? true
            : `${key} must not have leading or trailing whitespace`);
        return this;
    }
}
