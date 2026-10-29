import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { authRoutes } from "./routes/auth.js";
import { applicationRoutes } from "./routes/applications.js";

export function createApp(pool, options = {}) {
  const app = express();
  const production = process.env.NODE_ENV === "production";
  const secret = options.secret || process.env.SESSION_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("replace-"))
    throw new Error(
      "SESSION_SECRET must be a random string of at least 32 characters. Run npm run setup.",
    );
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: production ? undefined : false,
      strictTransportSecurity: production ? undefined : false,
    }),
  );
  app.use(express.json({ limit: "150kb" }));
  app.get("/api/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "database unavailable" });
    }
  });
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 180,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Please slow down and try again in a minute." },
    }),
  );
  const PgStore = connectPgSimple(session);
  const store =
    options.store ||
    new PgStore({ pool, tableName: "sessions", pruneSessionInterval: 900 });
  app.use(
    session({
      name: "shortlist.sid",
      store,
      secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: production,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const sent = req.get("X-CSRF-Token") || "";
    const expected = req.session.csrfToken || "";
    if (
      !expected ||
      Buffer.byteLength(sent) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(sent), Buffer.from(expected))
    ) {
      return res
        .status(403)
        .json({
          error: "Your session changed. Refresh the page and try again.",
        });
    }
    next();
  });
  app.use("/api/auth", authRoutes(pool));
  app.use("/api/applications", applicationRoutes(pool));
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "API route not found." }),
  );

  // On a regular Node server Express serves React files. On Netlify, the static
  // frontend is deployed separately from client/dist, so the function handles API only.
  if (options.serveFrontend !== false) {
    const dist = fileURLToPath(new URL("../client/dist", import.meta.url));
    app.use(express.static(dist));
    // Express 5 named wildcard: direct visits and refreshes on React routes work.
    app.get("/{*path}", (req, res) => res.sendFile(`${dist}/index.html`));
  }

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || 500;
    if (status >= 500)
      console.error("Request failed:", error.code || error.name);
    res.status(status).json({
      error:
        status < 500
          ? error.message
          : "Something went wrong. Please try again.",
    });
  });
  return app;
}
