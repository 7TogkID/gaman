import adminBlock from "./admin/admin.block.ts";
import userService from "./user.service.ts";
import userRoutes from "./user.routes.ts";
import { defineBlock } from "@gaman/core/block";

export default defineBlock({
  includes: [adminBlock],
  bindings: { userService: userService },
  path: "/user",
  routes: [userRoutes]
});
