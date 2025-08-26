import { ValidationSchema } from './define-validation';
export declare function validateData(data: Record<string, any>, schema: ValidationSchema): {
    valid: boolean;
    errors: Record<string, string[]>;
};
