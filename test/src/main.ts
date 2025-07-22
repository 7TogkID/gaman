import gaman, { next } from 'gaman';
import mainBlock from 'main.block';
import { gamanStatic } from 'gaman/static';

gaman.serv({
	blocks: [mainBlock],
	integrations: [
		gamanStatic()
	]
});
