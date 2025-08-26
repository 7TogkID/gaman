import { BaseRuleBuilder } from './rule/builder';
import { RuleString } from './rule/string';
export type ValidationSchema = Record<string, BaseRuleBuilder>;
export type ValidationFactory<TReturn extends object> = (g: typeof helpers) => TReturn;
export declare function defineValidation<TReturn extends object>(factory: ValidationFactory<TReturn>): TReturn;
declare const helpers: {
    string: () => RuleString;
    number: () => BaseRuleBuilder;
};
export {};
