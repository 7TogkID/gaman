/**
 * * ignored log from google request
 * @example1 /.well-known/appspecific/com.chrome.devtools.json
 * @example2 /sm/9c145d7e749b2e511c6391d6e25ebf7e7310e690b2ac66928f74b80d2f306a17.map
 */
export const IGNORED_LOG_FOR_PATH_REGEX = /^\/(\.well-known|sm|favicon.ico)(\/|$)/;
