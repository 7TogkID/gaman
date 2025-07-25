import { defineRoutes } from "gaman/routes";

export default defineRoutes(() => ({
  "/": () => ({ message: "OK!" }),
}));
