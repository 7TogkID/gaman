export const SRC_DIR = 'src',
	MAIN_BLOCK_PATH = `${SRC_DIR}/main.block.ts`,
	INDEX_PATH = `${SRC_DIR}/index.ts`;

/* -------------------------------------------------------------------------- */
/*                               COMPOSE FACTORY                              */
/* -------------------------------------------------------------------------- */
export const IS_COMPOSE_HANDLER_FACTORY = '___compose:handler___';
export const IS_COMPOSE_INTERCEPTOR_FACTORY = '___compose:interceptor___';

/* -------------------------------------------------------------------------- */
/*                                   FACTORY                                  */
/* -------------------------------------------------------------------------- */
export const IS_SERVICE_FACTORY = Symbol.for('gaman.isServiceFactory');
export const IS_ROUTES_FACTORY = Symbol.for('gaman.isRoutesFactory');
export const IS_BLOCK_SYMBOL = Symbol.for('gaman.isBlock');
export const IS_INTEGRATION_FACTORY_SYMBOL = Symbol.for(
	'gaman.isIntegrationFactory',
);

/* -------------------------------------------------------------------------- */
/*                                   HANDLER                                  */
/* -------------------------------------------------------------------------- */
export const IS_MIDDLEWARE_HANDLER = '___handler:middleware___';

/* -------------------------------------------------------------------------- */
/*                                  META DATA                                 */
/* -------------------------------------------------------------------------- */
export const MIDDLEWARE_CONFIG_METADATA = '___middleware:config___';
export const HTTP_REQUEST_METADATA = '___http:request___';
export const HTTP_RESPONSE_METADATA = '___http:response___';
export const RESPONSE_RENDER_METADATA = '___response:render___';

/**
 * * ignored log from google request
 * @example1 /.well-known/appspecific/com.chrome.devtools.json
 * @example2 /sm/9c145d7e749b2e511c6391d6e25ebf7e7310e690b2ac66928f74b80d2f306a17.map
 */
export const IGNORED_LOG_FOR_PATH_REGEX =
	/^\/(\.well-known|sm|favicon.ico)(\/|$)/;
