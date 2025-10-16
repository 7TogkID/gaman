import { IS_CONTROLLER } from '@gaman/common/contants.js';
import { ControllerFactory } from '@gaman/common/types/index.js';

export function composeController<Args extends any[]>(
	factory: ControllerFactory<Args>,
): ControllerFactory<Args> {
	Object.defineProperty(factory, IS_CONTROLLER, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return factory;
}
