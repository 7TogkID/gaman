export declare function parseArgs(argv?: string[]): {
    command: string;
    args: Record<string, any>;
};
export declare function parsePath(pathName: string): {
    path: string;
    dirPath: string;
    name: string;
};
export declare function removeStart(str: string, prefix: string): string;
export declare function removeEnd(str: string, suffix: string): string;
