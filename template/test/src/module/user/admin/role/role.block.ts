import roleService from "./role.service.ts";
import roleRoutes from "./role.routes.ts";
import { defineBlock } from "@gaman/core/block";

export default defineBlock({
  bindings: { roleService: roleService },
  path: "/role",
  routes: [roleRoutes]
});
