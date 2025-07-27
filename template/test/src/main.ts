import { TextFormat } from "gaman/utils";
import mainBlock from "./main.block";
import { defineBootstrap } from "gaman";

defineBootstrap(mainBlock, async (app) => {
  app.setStrict(true);

  app.listen(3431, "localhost", () => {
    Log.log(
      `Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`
    );
  });
});
