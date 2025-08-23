export const SRC_DIR = 'src',
	MAIN_BLOCK_PATH = `${SRC_DIR}/main.block.ts`,
	INDEX_PATH = `${SRC_DIR}/index.ts`;

export const RESPONSE_RENDER_SYMBOL = Symbol.for('gaman.responseRender');
export const HTTP_REQUEST_SYMBOL = Symbol.for('gaman.httpRequest');
export const HTTP_RESPONSE_SYMBOL = Symbol.for('gaman.httpResponse');
export const IS_SERVICE_FACTORY_SYMBOL = Symbol.for('gaman.isServiceFactory');
export const IS_ROUTES_FACTORY_SYMBOL = Symbol.for('gaman.isRoutesFactory');
export const IS_BLOCK_SYMBOL = Symbol.for('gaman.isBlock');
export const IS_MIDDLEWARE_SYMBOL = Symbol.for('gaman.isMiddleware');
export const IS_INTEGRATION_FACTORY_SYMBOL = Symbol.for(
	'gaman.isIntegrationFactory',
);

/**
 * * ignored log from google request
 * @example1 /.well-known/appspecific/com.chrome.devtools.json
 * @example2 /sm/9c145d7e749b2e511c6391d6e25ebf7e7310e690b2ac66928f74b80d2f306a17.map
 */
export const IGNORED_LOG_FOR_PATH_REGEX = /^\/(\.well-known|sm|favicon.ico)(\/|$)/;
