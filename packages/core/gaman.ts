import { Block } from "./block";
import { GamanApp } from "./gaman-app";
import type { AppConfig } from "./types";
import { loadEnv } from "@gaman/common/utils/load-env";
 
export async function defineBootstrap<A extends AppConfig>(
  mainBlock: Block<A>,
  cb: (app: GamanApp<A>) => any
) {
  loadEnv()

  const app = new GamanApp<A>(mainBlock);
  cb(app);
}
