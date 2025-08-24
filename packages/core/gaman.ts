import { GamanApp } from '@gaman/core/gaman-app';
import { loadEnv } from '@gaman/common/utils/load-env';

export async function defineBootstrap(cb: (app: GamanApp) => any) {
	loadEnv();

	const app = new GamanApp();
	cb(app);
}
