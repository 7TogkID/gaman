import { defineService } from "gaman/service";

interface Deps {
  db: string;
}

export default defineService(({ db }: Deps) => ({
  getDatabase: async () => db,
}));
