import gaman, { next } from 'gaman';
import mainBlock from 'main.block';
import { session } from 'gaman/session';

gaman.serv({
	blocks: [mainBlock],
	integrations: [
		session({
			driver: {
				type: 'mongodb',
				dbName: 'gaman',
				
			},
		}),
	],
	error(error, ctx) {
		console.log(error);
		return next();
	},
});
