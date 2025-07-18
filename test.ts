import { serv } from './src/gaman';
import { gamanStatic } from './src/integration/static';

serv({
	integrations: [gamanStatic({
    path: 'static'
  })],
});
