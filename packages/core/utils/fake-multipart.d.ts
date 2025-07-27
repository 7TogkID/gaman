type FilePart = {
    filename: string;
    contentType: string;
    content: string | Buffer;
};
type FormValue = string | FilePart;
export declare class MultipartForm {
    private boundary;
    private parts;
    constructor(boundary?: string);
    append(name: string, value: FormValue): void;
    getBoundary(): string;
    toString(): string;
}
export {};
