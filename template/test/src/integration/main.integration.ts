import { defineIntegration } from "gaman/integration";

export default defineIntegration(() => ({
  name: "tes",
  priority: "high",
  onLoad() {
    Log.log("Berhasil Load");
  },
  onRequest() {
    Log.info("Ha ada request ?");
    return next();
  },
  onResponse(_ctx, res) {
    Log.info("ada respon ya eheh");
    return res;
  },
}));
