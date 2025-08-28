export const SRC_DIR = 'src',
	MAIN_BLOCK_PATH = `${SRC_DIR}/main.block.ts`,
	INDEX_PATH = `${SRC_DIR}/index.ts`;
/* -------------------------------------------------------------------------- */
/*                                   FACTORY                                  */
/* -------------------------------------------------------------------------- */
export const IS_ROUTES_FACTORY = '___factory:routes___';
export const IS_INTEGRATION_FACTORY = '___factory:integration___';
export const IS_CONTROLLER_FACTORY = '___factory:controller___';
export const IS_INTERCEPTOR_FACTORY = '___factory:interceptor___';
export const IS_MIDDLEWARE_FACTORY = '___factory:middleware___';

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
