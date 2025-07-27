export declare const Logger: {
    level: string;
    response: {
        method: string;
        route: string;
        status: null;
    };
    log: (...msg: any[]) => void;
    info: (...msg: any[]) => void;
    debug: (...msg: any[]) => void;
    warn: (...msg: any[]) => void;
    error: (...msg: any[]) => void;
    _log: (type: "info" | "debug" | "warn" | "error", msg: any[]) => void;
    getStatusColor: (status: number | null) => "§e" | "§c" | "§8" | "§a" | "§4" | "§7";
    getStatusText: (status: number | null) => "" | "OK" | "Redirect" | "Client Err" | "Server Err";
    shouldLog: (level: "info" | "debug" | "warn" | "error") => boolean;
    setRoute(route: string): void;
    setStatus(status: number | null): void;
    setMethod(method: string): void;
    getShortTime: () => string;
};
export declare const Log: {
    level: string;
    response: {
        method: string;
        route: string;
        status: null;
    };
    log: (...msg: any[]) => void;
    info: (...msg: any[]) => void;
    debug: (...msg: any[]) => void;
    warn: (...msg: any[]) => void;
    error: (...msg: any[]) => void;
    _log: (type: "info" | "debug" | "warn" | "error", msg: any[]) => void;
    getStatusColor: (status: number | null) => "§e" | "§c" | "§8" | "§a" | "§4" | "§7";
    getStatusText: (status: number | null) => "" | "OK" | "Redirect" | "Client Err" | "Server Err";
    shouldLog: (level: "info" | "debug" | "warn" | "error") => boolean;
    setRoute(route: string): void;
    setStatus(status: number | null): void;
    setMethod(method: string): void;
    getShortTime: () => string;
};
