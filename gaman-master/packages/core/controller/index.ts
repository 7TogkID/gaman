import { IS_CONTROLLER } from '@gaman/common/contants.js';
import { ControllerFactory } from '@gaman/common/types/controller.types.js';

export function composeController(
	factory: ControllerFactory,
): ControllerFactory {
	Object.defineProperty(factory, IS_CONTROLLER, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return factory;
}
