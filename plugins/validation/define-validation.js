import { BaseRuleBuilder } from './rule/builder';
import { RuleString } from './rule/string';
export function defineValidation(factory) {
    return factory(helpers);
}
const helpers = {
    string: () => new RuleString(),
    number: () => new BaseRuleBuilder().custom((v) => typeof v === 'number' ? true : 'Must be a number'),
};
const t = defineValidation((g) => ({
    name: g.string().email(),
    $tes: g.string().notEmpty(),
    tes: {
        other: g.string().email(),
    },
}));
function parse(data) {
    return data;
}
