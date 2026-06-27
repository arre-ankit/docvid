import "server-only";

import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleBetterSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { schema } from "./schema";

type DocvidDb = ReturnType<typeof drizzleBetterSqlite<typeof schema>>;

let localDb: DocvidDb | null = null;

function getLocalDbPath() {
  return path.join(process.cwd(), ".data", "docvid-local.sqlite");
}

function ensureLocalMigrations(sqlite: Database.Database) {
  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    sqlite
      .prepare("SELECT name FROM __drizzle_migrations")
      .all()
      .map((row) => (row as { name: string }).name),
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    sqlite.exec(sql);
    sqlite.prepare("INSERT INTO __drizzle_migrations (name) VALUES (?)").run(file);
  }
}

function createLocalDb() {
  const dir = path.dirname(getLocalDbPath());
  fs.mkdirSync(dir, { recursive: true });
  const sqlite = new Database(getLocalDbPath());
  ensureLocalMigrations(sqlite);
  return drizzleBetterSqlite(sqlite, { schema });
}

/** Drizzle client — D1 in Workers, local SQLite in plain `next dev`. */
export async function getDb() {
  let cloudflareEnv: { DB?: D1Database } | null = null;
  try {
    const { env } = await getCloudflareContext({ async: true });
    cloudflareEnv = env as { DB?: D1Database };
  } catch {
    // Outside the Workers runtime (plain `next dev`).
  }

  if (cloudflareEnv) {
    const db = cloudflareEnv.DB;
    if (!db) {
      throw new Error("D1 binding DB is not configured");
    }
    return drizzle(db, { schema });
  }

  if (!localDb) {
    localDb = createLocalDb();
  }
  return localDb;
}

export * from "drizzle-orm";
export * from "./schema";
