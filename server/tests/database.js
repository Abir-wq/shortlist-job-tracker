// Tests use a real embedded PostgreSQL engine without touching your Neon database.
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
export async function testDatabase() {
  const db = new PGlite();
  await db.exec(
    await readFile(new URL("../schema.sql", import.meta.url), "utf8"),
  );
  const pool = {
    async query(sql, params = []) {
      const result = await db.query(sql, params);
      return { ...result, rowCount: result.affectedRows ?? result.rows.length };
    },
    async connect() {
      return { query: pool.query, release() {} };
    },
    async end() {
      await db.close();
    },
  };
  return pool;
}
