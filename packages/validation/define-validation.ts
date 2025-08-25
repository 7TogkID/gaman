import { BaseRuleBuilder } from './rule/builder';
import { RuleString } from './rule/string';

export type ValidationSchema = Record<string, BaseRuleBuilder>;

export type ValidationFactory<TReturn extends object> = (
	g: typeof helpers,
) => TReturn;

export function defineValidation<TReturn extends object>(
	factory: ValidationFactory<TReturn>,
) {
	return factory(helpers);
}

const helpers = {
	string: () => new RuleString(),
	number: () =>
		new BaseRuleBuilder().custom((v) =>
			typeof v === 'number' ? true : 'Must be a number',
		),
};

const t = defineValidation((g) => ({
	name: g.string().email(),
	$tes: g.string().notEmpty(),
	tes: {
		other: g.string().email(),
	},
}));

function parse<TValue extends object, TReturn extends object>(
	data: TValue,
): TReturn {
	return data;
}
