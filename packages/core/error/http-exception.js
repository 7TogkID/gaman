export class HttpException extends Error {
    constructor(status, message, details) {
        super(message);
        this.name = "HttpException";
        this.status = status;
        this.details = details;
        // Maintain proper stack trace (only works on V8 environments like Node.js)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpException);
        }
    }
    toJSON() {
        return {
            status: this.status,
            message: this.message,
            details: this.details,
        };
    }
}
