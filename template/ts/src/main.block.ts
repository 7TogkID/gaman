import { defineBlock } from "gaman/block";

export default defineBlock({
  path: "/",
  routes: {
    "/": () => r.json({ message: "❤️ Welcome to GamanJS" }),
  },
});