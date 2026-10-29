import serverless from "serverless-http";
import { pool } from "../../server/db.js";
import { createApp } from "../../server/app.js";

const app = createApp(pool, { serveFrontend: false });

export const handler = serverless(app);
