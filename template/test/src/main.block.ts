import { defineBlock } from "gaman/block";
import mainService from "./main.service";
import mainRoutes from "./main.routes";

export default defineBlock({
  path: "/",
  routes: [mainRoutes],
  services: {
    appService: mainService,
  },
  depedencies: {
    db: "ANgga",
  },

});
