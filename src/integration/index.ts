import { GamanBase } from "../gaman-base";
import { Response } from "../response";
import { AppConfig, Context, NextResponse, Priority } from "../types";

export type IntegrationFactory<A extends AppConfig = AppConfig> = (
  app: GamanBase<A>
) => {
  /**
   * The name of the integration.
   * This property is required.
   */
  name: string;

  /**
   * The priority of the integration.
   * This property is required and determines the execution order of integrations.
   */
  priority: Priority;

  /**
   * Callback executed when the integration is loaded.
   * Use this to perform setup or initialization tasks.
   */
  onLoad?: () => void;

  /**
   * Callback executed when the integration is disabled.
   * Use this to clean up or remove configurations.
   */
  onDisabled?: () => void;

  /**
   * Callback executed when a client makes a request to the server.
   * This allows you to modify the context or handle specific request logic.
   */
  onRequest?: (ctx: Context<A>) => NextResponse;

  /**
   * Callback executed before the response is sent to the client.
   * Use this to modify or enhance the response.
   */
  onResponse?: (ctx: Context<A>, res: Response) => Promise<Response> | Response;
};

export function defineIntegration<A extends AppConfig>(
  integration: IntegrationFactory<A>
): IntegrationFactory<A> {
  return integration;
}
