"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.Logger = void 0;
const textformat_1 = require("./textformat");
exports.Logger = {
    level: 'debug',
    response: {
        method: '',
        route: '',
        status: null,
    },
    log: (...msg) => exports.Logger.info(...msg),
    info: (...msg) => exports.Logger._log('info', msg),
    debug: (...msg) => exports.Logger._log('debug', msg),
    warn: (...msg) => exports.Logger._log('warn', msg),
    error: (...msg) => exports.Logger._log('error', msg),
    _log: (type, msg) => {
        if (!exports.Logger.shouldLog(type))
            return;
        const time = exports.Logger.getShortTime();
        const status = exports.Logger.response.status ?? '';
        const method = exports.Logger.response.method?.toUpperCase() || '';
        const route = exports.Logger.response.route || '';
        const colorPrefix = {
            info: '§a[INFO~]',
            debug: '§b[DEBUG]',
            warn: '§e[WARN~]',
            error: '§c[ERROR]',
        };
        const color = {
            info: '§r',
            debug: '§b',
            warn: '§e',
            error: '§c',
        };
        const statusColor = exports.Logger.getStatusColor(exports.Logger.response.status);
        const text = `${colorPrefix[type]} §8[${time}]` +
            (method && route ? ` §7[§d${method}§7] §f${route}` : '') +
            (status !== '' ? ` §7[${statusColor}${status} ${exports.Logger.getStatusText(status)}§7]` : '');
        console[type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log'](textformat_1.TextFormat.format(text) + textformat_1.TextFormat.format(color[type]), ...msg.map((m) => textformat_1.TextFormat.format(String(m))), textformat_1.TextFormat.RESET);
    },
    getStatusColor: (status) => {
        if (!status)
            return '§8';
        if (status >= 200 && status < 300)
            return '§a';
        if (status >= 300 && status < 400)
            return '§e';
        if (status >= 400 && status < 500)
            return '§c';
        if (status >= 500)
            return '§4';
        return '§7';
    },
    getStatusText: (status) => {
        if (!status)
            return '';
        if (status >= 200 && status < 300)
            return 'OK';
        if (status >= 300 && status < 400)
            return 'Redirect';
        if (status >= 400 && status < 500)
            return 'Client Err';
        if (status >= 500)
            return 'Server Err';
        return '';
    },
    shouldLog: (level) => {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
        };
        return levels[level] <= levels[exports.Logger.level];
    },
    setRoute(route) {
        exports.Logger.response.route = route;
    },
    setStatus(status) {
        //@ts-ignore
        exports.Logger.response.status = status;
    },
    setMethod(method) {
        exports.Logger.response.method = method;
    },
    getShortTime: () => {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    },
};
exports.Log = exports.Logger;
