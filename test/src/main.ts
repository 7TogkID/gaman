import gaman, { next } from 'gaman';
import mainBlock from 'main.block';
import userBlock from 'user/user.block';

gaman.serv({
	blocks: [mainBlock, userBlock],
	error(error, ctx) {
    console.log(error)
		return next();

	},
});
