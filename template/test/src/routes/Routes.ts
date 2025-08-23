import { composeRoutes } from '@gaman/core/routes';
import MainHandler from 'handler/MainHandler';

export default composeRoutes((route) => {
	route('/').methods('GET', 'DELETE').handler(MainHandler, 'CreateHandler');

	route('/anu/:name')
		.methods('GET', 'POST')
		.group((route) => {
			route('/').handler((ctx) => {
				return Res.json({ message: 'OK!' });
			});
			route('/tes').handler((ctx) => {
				return Res.text(ctx.param('name'));
			});

			route('/anu2').group((route) => {
				route('/hehe')
					.method('GET')
					.handler((ctx) => {
						return `<h1>${ctx.param('name')}</h1>`;
					});
			});
		});
});
