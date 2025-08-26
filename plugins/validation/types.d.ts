export interface ValidationData {
    [key: string]: any;
}
export type Rule = 'string' | 'number' | 'boolean' | 'required' | {
    min: number;
} | {
    max: number;
} | {
    length: number;
} | {
    pattern: RegExp;
} | {
    custom: (value: any) => boolean | string;
};
export type ValidationRules = {
    [key: string]: Rule[];
};
export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string[]>;
}
