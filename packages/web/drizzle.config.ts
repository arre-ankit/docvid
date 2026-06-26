import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

function getLocalD1Db() {
  try {
    const basePath = path.resolve(".wrangler");
    const dbFile = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .find((f) => typeof f === "string" && f.endsWith(".sqlite"));
    if (!dbFile) return undefined;
    return path.resolve(basePath, dbFile);
  } catch {
    return undefined;
  }
}

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: getLocalD1Db() ?? "./.data/docvid-local.sqlite",
  },
});
