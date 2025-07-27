import { Buffer } from "node:buffer";
export interface ParsedMultipart {
    name: string;
    isText: boolean;
    isFile: boolean;
    filename?: string;
    text?: string;
    mediaType?: string;
    content: Buffer;
}
export declare function parseMultipart(data: Buffer, boundary: string): ParsedMultipart[];
