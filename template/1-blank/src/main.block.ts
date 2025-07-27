
import { defineBlock } from "@gaman/core/block";
import mainRoutes from "./main.routes";

export default defineBlock({
  path: "/",
  routes: [mainRoutes],
});
 