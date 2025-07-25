import { defineRoutes } from "gaman/routes";
import mainService from "./main.service.ts";

interface Deps {
  db: string,
  appService: ReturnType<typeof mainService>;
}

export default defineRoutes(({ db, appService }: Deps) => ({
  "/": async (ctx) => {
    return r.text(await appService.getDatabase())
  },
}));
  
