export const SRC_DIR = 'src',
	MAIN_BLOCK_PATH = `${SRC_DIR}/main.block.ts`,
	INDEX_PATH = `${SRC_DIR}/index.ts`;
/* -------------------------------------------------------------------------- */
/*                                   IS WHAT?                                 */
/* -------------------------------------------------------------------------- */
export const IS_ROUTES = '___is:routes___';
export const IS_INTEGRATION = '___is:integration___';
export const IS_CONTROLLER = '___is:controller___';
export const IS_INTERCEPTOR = '___is:interceptor___';
export const IS_MIDDLEWARE = '___is:middleware___';
export const IS_EXCEPTION_HANDLER = '___is:exception___';

/* -------------------------------------------------------------------------- */
/*                                   HANDLER                                  */
/* -------------------------------------------------------------------------- */
export const IS_MIDDLEWARE_HANDLER = '___handler:middleware___';

/* -------------------------------------------------------------------------- */
/*                                  META DATA                                 */
/* -------------------------------------------------------------------------- */
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
