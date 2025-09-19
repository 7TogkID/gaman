import { BaseRuleBuilder } from './builder';

/**
 * RuleNumber extends BaseRuleBuilder with number-specific validation rules.
 */
export class RuleNumber extends BaseRuleBuilder {
	/**
	 * Validates that the value is a number.
	 */
	number() {
		this.rules.push((key, val) =>
			typeof val === 'number' ? true : `${key} must be a number`,
		);
		return this;
	}

	/**
	 * Validates that the number is greater than or equal to the given value.
	 * @param minValue - Minimum allowed value.
	 */
	min(minValue: number) {
		this.rules.push((key, val) =>
			typeof val === 'number' && val >= minValue
				? true
				: `${key} must be at least ${minValue}`,
		);
		return this;
	}

	/**
	 * Validates that the number is less than or equal to the given value.
	 * @param maxValue - Maximum allowed value.
	 */
	max(maxValue: number) {
		this.rules.push((key, val) =>
			typeof val === 'number' && val <= maxValue
				? true
				: `${key} must be at most ${maxValue}`,
		);
		return this;
	}

	/**
	 * Validates that the number is strictly greater than the given value.
	 * @param value - The value to compare against.
	 */
	greaterThan(value: number) {
		this.rules.push((key, val) =>
			typeof val === 'number' && val > value
				? true
				: `${key} must be greater than ${value}`,
		);
		return this;
	}

	/**
	 * Validates that the number is strictly less than the given value.
	 * @param value - The value to compare against.
	 */
	lessThan(value: number) {
		this.rules.push((key, val) =>
			typeof val === 'number' && val < value
				? true
				: `${key} must be less than ${value}`,
		);
		return this;
	}

	/**
	 * Validates that the number is an integer (whole number).
	 */
	integer() {
		this.rules.push((key, val) =>
			Number.isInteger(val) ? true : `${key} must be an integer`,
		);
		return this;
	}

	/**
	 * Validates that the number is a positive number.
	 */
	positive() {
		this.rules.push((key, val) =>
			typeof val === 'number' && val > 0
				? true
				: `${key} must be a positive number`,
		);
		return this;
	}

	/**
	 * Validates that the number is a negative number.
	 */
	negative() {
		this.rules.push((key, val) =>
			typeof val === 'number' && val < 0
				? true
				: `${key} must be a negative number`,
		);
		return this;
	}

	/**
	 * Validates that the number is divisible by a given number.
	 * @param divisor - The divisor to check against.
	 */
	divisibleBy(divisor: number) {
		this.rules.push((key, val) =>
			typeof val === 'number' && val % divisor === 0
				? true
				: `${key} must be divisible by ${divisor}`,
		);
		return this;
	}

	/**
	 * Validates that the number is between min and max (inclusive).
	 * @param min - Minimum value.
	 * @param max - Maximum value.
	 */
	between(min: number, max: number) {
		this.rules.push((key, val) =>
			typeof val === 'number' && val >= min && val <= max
				? true
				: `${key} must be between ${min} and ${max}`,
		);
		return this;
	}
}
