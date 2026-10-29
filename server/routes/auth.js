import { Router } from "express";
import { randomUUID, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { text, invalid } from "../validation.js";

export function authRoutes(pool) {
  const router = Router();
  const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again in 15 minutes." },
  });
  router.get("/me", async (req, res) => {
    if (!req.session.csrfToken)
      req.session.csrfToken = randomBytes(32).toString("hex");
    let user = null;
    if (req.session.userId) {
      const result = await pool.query(
        "SELECT id, name, email FROM users WHERE id=$1",
        [req.session.userId],
      );
      user = result.rows[0] || null;
    }
    res.json({ user, csrfToken: req.session.csrfToken });
  });
  async function signIn(req, res, user) {
    // Regenerate the session after authentication to prevent session fixation.
    await new Promise((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );
    req.session.userId = user.id;
    req.session.csrfToken = randomBytes(32).toString("hex");
    await new Promise((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve())),
    );
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      csrfToken: req.session.csrfToken,
    });
  }
  router.post("/register", limit, async (req, res) => {
    const name = text(req.body.name, "Name", 80, true);
    const email = text(req.body.email, "Email", 254, true).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      invalid("Enter a valid email address.");
    const password = req.body.password;
    if (
      typeof password !== "string" ||
      password.length < 10 ||
      Buffer.byteLength(password) > 72
    )
      invalid("Use a password of at least 10 characters and at most 72 bytes.");
    const hash = await bcrypt.hash(password, 12);
    try {
      const result = await pool.query(
        "INSERT INTO users (id,name,email,password_hash) VALUES ($1,$2,$3,$4) RETURNING id,name,email",
        [randomUUID(), name, email, hash],
      );
      await signIn(req, res, result.rows[0]);
    } catch (error) {
      if (error.code === "23505")
        return res
          .status(409)
          .json({
            error:
              "An account with this email already exists. Sign in instead.",
          });
      throw error;
    }
  });
  router.post("/login", limit, async (req, res) => {
    const email = text(req.body.email, "Email", 254, true).toLowerCase();
    const password = req.body.password;
    if (typeof password !== "string" || Buffer.byteLength(password) > 72)
      invalid("Check your email and password.");
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    const user = result.rows[0];
    // A dummy hash keeps unknown-email attempts on the password-verification path.
    const hash =
      user?.password_hash ||
      "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5ZzFZ4BgYbqXm6a87bD2qR.UgoJ7IuK";
    const matches = await bcrypt.compare(password, hash);
    if (!user || !matches)
      return res.status(401).json({ error: "Email or password is incorrect." });
    await signIn(req, res, user);
  });
  router.post("/logout", (req, res, next) => {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie("shortlist.sid", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.json({ ok: true });
    });
  });
  return router;
}
