import roleBlock from "./role/role.block.ts";
import adminService from "./admin.service.ts";
import adminRoutes from "./admin.routes.ts";
import { defineBlock } from "@gaman/core/block";

export default defineBlock({
  includes: [roleBlock],
  bindings: { adminService: adminService },
  path: "/admin",
  routes: [adminRoutes]
});
