import "dotenv/config";
import { pool } from "./db.js";
import { createApp } from "./app.js";

const app = createApp(pool);
const port = Number(process.env.PORT) || 3001;
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`Shortlist API is listening on port ${port}.`),
);
function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
