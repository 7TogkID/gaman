import { Block } from "./block";
import { GamanApp } from "./gaman-app";
import type { AppConfig } from "./types";
import { loadEnv } from "./utils/load-env";
import { Log } from "./utils/logger";

export async function defineBootstrap<A extends AppConfig>(
  mainBlock: Block<A>,
  cb: (app: GamanApp<A>) => any
) {
  Log.log(`Starting Gaman application...`);
  loadEnv();

  if (!process.env.GAMAN_KEY) {
    Log.error(
      "Missing GAMAN_KEY in your environment.\n" +
        "Please generate one by running the following command:\n\n" +
        "  npx gaman key:generate\n"
    );
    return process.exit();
  }

  const app = new GamanApp<A>(mainBlock);
  cb(app);
}
