import * as http from 'node:http';
import { Router } from '@gaman/core/router/handler.js';
import { parseArgs } from '@gaman/common/index.js';

export class GamanApp extends Router {
	private server?: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	>;

	async mountServer(address?: string) {
		const { args } = parseArgs();

		const DEFAULT_HOST =
			args['host'] === true
				? '0.0.0.0'
				: args['host'] || process.env.HOST || '127.0.0.1';

		const DEFAULT_PORT =
			args['port'] ||
			(process.env.PORT ? parseInt(process.env.PORT, 10) : 3431);

		let host = DEFAULT_HOST;
		let port = DEFAULT_PORT;

		if (address) {
			const [h, p] = address.split(':');

			if (h) host = h;
			if (p) port = parseInt(p, 10);
		}

		return new Promise<void>((resolve, reject) => {
			try {
				this.server = http.createServer(this.requestHandle.bind(this));
				this.server.listen(port, host == true ? '0.0.0.0' : `${host}`, resolve);
				this.server.on('error', reject);
			} catch (err) {
				reject(err);
			}
		});
	}

	async close() {
		return new Promise<void>((resolve, reject) => {
			if (!this.server) {
				return reject(new Error('Server is not running'));
			}
			this.server.close((err) => {
				if (err) return reject(err);
				resolve();
			});
		});
	}
}
