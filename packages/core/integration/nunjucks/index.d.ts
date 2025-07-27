/**
 * @module
 * GamanJS integration for Nunjucks view rendering.
 */
import { Priority } from "../../types";
import type { ConfigureOptions, Environment } from "nunjucks";
/**
 * Nunjucks rendering options.
 * These options are passed directly to the Nunjucks renderer.
 * You can find the full list of supported options at:
 * @url https://mozilla.github.io/nunjucks/api.html#configure
 */
export interface GamanNunjucksOptions extends Omit<ConfigureOptions, "express"> {
    /**
     * Directory path for views.
     * This specifies the root directory where your Nunjucks templates are located.
     * Default: `src/views`.
     */
    viewPath?: string;
    /**
     * Priority Integrations
     * Default: `normal`
     */
    priority?: Priority;
    /**
     * Custom environment handler for Nunjucks.
     *
     * Allows you to modify the `nunjucks.Environment` instance after it is configured.
     * You can use this to add custom filters, globals, extensions, or any other environment settings.
     *
     * Example:
     * ```ts
     * nunjucks({
     *   env(env) {
     *     env.addFilter("uppercase", str => str.toUpperCase());
     *     env.addGlobal("appName", "GamanJS");
     *   }
     * });
     * ```
     *
     * You can also provide an array of functions if you want to split your configuration logic:
     *
     * Example:
     * ```ts
     * nunjucks({
     *   env: [
     *     env => env.addFilter("upper", str => str.toUpperCase()),
     *     env => env.addGlobal("title", "My Site")
     *   ]
     * });
     * ```
     */
    env?: (env: Environment) => void | ((env: Environment) => void)[];
    /**
     * Template file extension.
     *
     * This specifies the extension used for your Nunjucks template files.
     * It will be automatically appended when rendering views.
     *
     * Default: `.njk`
     *
     * Example:
     * ```ts
     * extension: '.html' // Will render `index.html` instead of `index.njk`
     * ```
     */
    extension?: string;
}
export declare function nunjucks(ops?: GamanNunjucksOptions): import("..").IntegrationFactory<import("../../types").AppConfig>;
