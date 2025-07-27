import { defineRoutes } from "gaman/routes";

export default defineRoutes(() => ({
  "/": (ctx) => {
    return r.json({ message: "❤️ Welcome to GamanJS" });
  },
}));
