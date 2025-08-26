export function validateData(data, schema) {
    const errors = {};
    for (const key in schema) {
        const value = data[key];
        const rules = schema[key].getRules();
        for (const rule of rules) {
            const result = rule(key, value);
            if (result !== true) {
                if (!errors[key])
                    errors[key] = [];
                errors[key].push(result);
            }
        }
    }
    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}
