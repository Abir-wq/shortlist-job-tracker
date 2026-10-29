import "dotenv/config";
import pg from "pg";

if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes("USER:PASSWORD")
) {
  throw new Error(
    "Add your PostgreSQL connection string to DATABASE_URL in .env. See README.md.",
  );
}
// Keep date-only reminders as YYYY-MM-DD strings, without time-zone conversion.
pg.types.setTypeParser(1082, (value) => value);
// pg reads TLS settings from the connection string. Never turn certificate checks off.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});
pool.on("error", () =>
  console.error(
    "An idle database connection failed. Check database availability.",
  ),
);
