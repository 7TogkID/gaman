export declare class HttpException extends Error {
    status: number;
    details?: any;
    constructor(status: number, message: string, details?: any);
    toJSON(): {
        status: number;
        message: string;
        details: any;
    };
}
