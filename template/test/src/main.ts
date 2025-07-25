import mainIntegration from "integration/main.integration.ts";
import mainBlock from "./main.block.ts";
import gaman from "gaman";

gaman.serv({
  block: mainBlock,
  integrations: [mainIntegration],
});
