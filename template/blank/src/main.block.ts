import { defineBlock } from "gaman/block";
import mainRoutes from "./main.routes.ts";

export default defineBlock({
  path: "/",
  routes: [mainRoutes],
});
 