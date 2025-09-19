import { Interceptor } from '@gaman/common/types/interceptor.types.js';

const interceptors: Array<Interceptor> = [];

function register(...interceptor: Interceptor[]) {
	interceptors.push(...interceptor);
}
function getInterceptors(): Interceptor[] {
	return interceptors;
}

export default {
	register,
	getInterceptors,
};
