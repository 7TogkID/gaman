import { GamanHeaders } from './headers';
export declare class RenderResponse {
    #private;
    constructor(viewName: string, viewData?: Record<string, any>, init?: IResponseOptions);
    getName(): string;
    getData(): Record<string, any>;
    getOptions(): IResponseOptions;
}
declare const responseRenderSymbol: unique symbol;
export interface IResponseOptions {
    status?: number;
    statusText?: string;
    headers?: Record<string, string | string[]>;
}
export declare class Response {
    body?: any | undefined;
    [responseRenderSymbol]: RenderResponse | null;
    headers: GamanHeaders;
    status: number;
    statusText: string;
    constructor(body?: any | undefined, options?: IResponseOptions);
    static json(data: any, init?: IResponseOptions): Response;
    static text(message: string, init?: IResponseOptions): Response;
    static html(body: string, init?: IResponseOptions): Response;
    static render(viewName: string, viewData?: Record<string, any>, init?: IResponseOptions): Response;
    static stream(readableStream: NodeJS.ReadableStream, init?: IResponseOptions): Response;
    static redirect(location: string, statusNumber?: number): Response;
    /**
     * Akses helper untuk render view
     */
    get renderData(): RenderResponse | null;
}
export {};
