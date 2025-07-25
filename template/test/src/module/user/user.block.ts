import { defineBlock } from "gaman/block";
import userRoutes from "./user.routes.ts";

export default defineBlock({
  path: "/user",
  routes: [userRoutes],
});
