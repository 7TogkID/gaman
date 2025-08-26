import { IS_CONTROLLER_FACTORY } from '@gaman/common/contants';
import { ControllerFactory } from '@gaman/common/types/controller.types';

export function composeController(
	factory: ControllerFactory,
): ControllerFactory {
	Object.defineProperty(factory, IS_CONTROLLER_FACTORY, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return factory;
}
