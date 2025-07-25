import { defineBlock } from "gaman/block";
import mainService from "./main.service.ts";
import mainRoutes from "./main.routes.ts";
import userBlock from "module/user/user.block.ts";

export default defineBlock({
  path: "/",
  blocks: [userBlock],
  routes: [mainRoutes],
  services: {
    appService: mainService,
  },
  depedencies: {
    db: "ANgga",
  },

});
