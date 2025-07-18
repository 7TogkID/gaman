import { TextFormat } from './textformat';

export const Logger = {
	level: 'debug',
	response: {
		method: '',
		route: '',
		status: null,
	},

	log: (...msg: any[]) => Logger.info(...msg),

	info: (...msg: any[]) => Logger._log('info', msg),
	debug: (...msg: any[]) => Logger._log('debug', msg),
	warn: (...msg: any[]) => Logger._log('warn', msg),
	error: (...msg: any[]) => Logger._log('error', msg),

	_log: (type: 'info' | 'debug' | 'warn' | 'error', msg: any[]) => {
		if (!Logger.shouldLog(type)) return;

		const time = Logger.getShortTime();
		const status = Logger.response.status ?? '';
		const method = Logger.response.method?.toUpperCase() || '';
		const route = Logger.response.route || '';

		const colorPrefix: Record<typeof type, string> = {
			info: '§a[INFO~]',
			debug: '§b[DEBUG]',
			warn: '§e[WARN~]',
			error: '§c[ERROR]',
		};

		const color: Record<typeof type, string> = {
			info: '§r',
			debug: '§b',
			warn: '§e',
			error: '§c',
		};

		const statusColor = Logger.getStatusColor(Logger.response.status);

		const text =
			`${colorPrefix[type]} §8[${time}]` +
			(method && route ? ` §7[§d${method}§7] §f${route}` : '') +
			(status !== '' ? ` §7[${statusColor}${status} ${Logger.getStatusText(status)}§7]` : '');

		console[type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log'](
			TextFormat.format(text) + TextFormat.format(color[type]),
			...msg.map(TextFormat.format),
		);
	},

	getStatusColor: (status: number | null) => {
		if (!status) return '§8';
		if (status >= 200 && status < 300) return '§a';
		if (status >= 300 && status < 400) return '§e';
		if (status >= 400 && status < 500) return '§c';
		if (status >= 500) return '§4';
		return '§7';
	},

	getStatusText: (status: number | null) => {
		if (!status) return '';
		if (status >= 200 && status < 300) return 'OK';
		if (status >= 300 && status < 400) return 'Redirect';
		if (status >= 400 && status < 500) return 'Client Err';
		if (status >= 500) return 'Server Err';
		return '';
	},

	shouldLog: (level: 'info' | 'debug' | 'warn' | 'error') => {
		const levels: Record<string, number> = {
			error: 0,
			warn: 1,
			info: 2,
			debug: 3,
		};
		return levels[level] <= levels[Logger.level];
	},

	setRoute(route: string) {
		Logger.response.route = route;
	},

	setStatus(status: number | null) {
		Logger.response.status = status;
	},

	setMethod(method: string) {
		Logger.response.method = method;
	},

	getShortTime: () => {
		const now = new Date();
		return now.toTimeString().split(' ')[0];
	},
};

export const Log = Logger;
