import { BaseRuleBuilder } from './builder';
/**
 * RuleNumber extends BaseRuleBuilder with number-specific validation rules.
 */
export declare class RuleNumber extends BaseRuleBuilder {
    /**
     * Validates that the value is a number.
     */
    number(): this;
    /**
     * Validates that the number is greater than or equal to the given value.
     * @param minValue - Minimum allowed value.
     */
    min(minValue: number): this;
    /**
     * Validates that the number is less than or equal to the given value.
     * @param maxValue - Maximum allowed value.
     */
    max(maxValue: number): this;
    /**
     * Validates that the number is strictly greater than the given value.
     * @param value - The value to compare against.
     */
    greaterThan(value: number): this;
    /**
     * Validates that the number is strictly less than the given value.
     * @param value - The value to compare against.
     */
    lessThan(value: number): this;
    /**
     * Validates that the number is an integer (whole number).
     */
    integer(): this;
    /**
     * Validates that the number is a positive number.
     */
    positive(): this;
    /**
     * Validates that the number is a negative number.
     */
    negative(): this;
    /**
     * Validates that the number is divisible by a given number.
     * @param divisor - The divisor to check against.
     */
    divisibleBy(divisor: number): this;
    /**
     * Validates that the number is between min and max (inclusive).
     * @param min - Minimum value.
     * @param max - Maximum value.
     */
    between(min: number, max: number): this;
}
