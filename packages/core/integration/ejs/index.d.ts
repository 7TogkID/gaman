/**
 * @module
 * GamanJS integration for EJS view rendering.
 */
import { type Options } from 'ejs';
import { Priority } from '../../types';
/**
 * EJS rendering options.
 * These options are passed directly to the EJS renderer.
 * You can find the full list of supported options at:
 * @url https://github.com/mde/ejs?tab=readme-ov-file#options
 */
export interface GamanEJSOptions extends Options {
    /**
     * Directory path for views.
     * This specifies the root directory where your EJS templates are located.
     * Default: `src/views`.
     */
    viewPath?: string;
    /**
     * Priority Integrations
     * @default normal
     */
    priority?: Priority;
}
export declare function ejs(ops?: GamanEJSOptions): import("..").IntegrationFactory<import("../../types").AppConfig>;
