import { GamanBase } from './gaman-base';
import type { AppConfig, AppOptions } from './types';
import { Log } from './utils/logger';

const defaultOptions = {
	server: {
		host: 'localhost',
		port: 3431,
	},
};

export async function serv<A extends AppConfig>(
	options: AppOptions<A> = defaultOptions,
): Promise<GamanBase<A>> {
	const app = new GamanBase<A>(options);
	await app.listen();

	if (!process.env.GAMAN_KEY) {
		Log.error(
			'Missing GAMAN_KEY in your environment.\n' +
				'Please generate one by running the following command:\n\n' +
				'  npx gaman key:generate\n',
		);
		await app.close();
		await process.exit(1);
	}

	return app;
}
