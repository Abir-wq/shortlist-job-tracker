import { Router } from "express";
import { randomUUID } from "node:crypto";
import { applicationInput } from "../validation.js";
import { sampleApplications } from "../samples.js";

const fields = [
  "company",
  "role",
  "location",
  "job_url",
  "salary",
  "status",
  "applied_date",
  "follow_up_date",
  "interview_at",
  "contact_name",
  "next_action",
  "notes",
  "prep",
  "questions",
];
const values = (input) =>
  fields.map((key) =>
    ["prep", "questions"].includes(key)
      ? JSON.stringify(input[key])
      : input[key],
  );
const insertSQL = `INSERT INTO applications (id,user_id,${fields.join(",")},is_sample) VALUES (${Array.from({ length: 17 }, (_, i) => "$" + (i + 1)).join(",")}) RETURNING *`;

// Date-only fields have a stable API format, including in the embedded test engine.
function serialize(row) {
  const result = { ...row };
  for (const key of ["applied_date", "follow_up_date"]) {
    if (result[key] instanceof Date)
      result[key] = result[key].toISOString().slice(0, 10);
  }
  return result;
}

export function applicationRoutes(pool) {
  const router = Router();
  router.use((req, res, next) => {
    if (!req.session.userId)
      return res.status(401).json({ error: "Please sign in to continue." });
    next();
  });
  router.param("id", (req, res, next, id) => {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      return res.status(404).json({ error: "Application not found." });
    next();
  });
  router.get("/", async (req, res) => {
    const result = await pool.query(
      "SELECT * FROM applications WHERE user_id=$1 ORDER BY created_at DESC",
      [req.session.userId],
    );
    res.json(result.rows.map(serialize));
  });
  router.post("/samples", async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Lock this user so simultaneous clicks cannot insert samples twice.
      await client.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
        req.session.userId,
      ]);
      const existing = await client.query(
        "SELECT id FROM applications WHERE user_id=$1 LIMIT 1",
        [req.session.userId],
      );
      if (existing.rows.length) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({ error: "Samples can only be added to an empty workspace." });
      }
      for (const sample of sampleApplications()) {
        await client.query(insertSQL, [
          randomUUID(),
          req.session.userId,
          ...values(applicationInput(sample)),
          true,
        ]);
      }
      await client.query("COMMIT");
      res.status(201).json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
  router.delete("/samples", async (req, res) => {
    await pool.query(
      "DELETE FROM applications WHERE user_id=$1 AND is_sample=TRUE",
      [req.session.userId],
    );
    res.json({ ok: true });
  });
  router.post("/", async (req, res) => {
    const input = applicationInput(req.body);
    const result = await pool.query(insertSQL, [
      randomUUID(),
      req.session.userId,
      ...values(input),
      false,
    ]);
    res.status(201).json(serialize(result.rows[0]));
  });
  router.get("/:id", async (req, res) => {
    const result = await pool.query(
      "SELECT * FROM applications WHERE id=$1 AND user_id=$2",
      [req.params.id, req.session.userId],
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Application not found." });
    res.json(serialize(result.rows[0]));
  });
  router.put("/:id", async (req, res) => {
    const input = applicationInput(req.body);
    const assignments = fields.map((key, i) => `${key}=$${i + 1}`).join(",");
    const result = await pool.query(
      `UPDATE applications SET ${assignments},updated_at=NOW() WHERE id=$15 AND user_id=$16 RETURNING *`,
      [...values(input), req.params.id, req.session.userId],
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Application not found." });
    res.json(serialize(result.rows[0]));
  });
  router.delete("/:id", async (req, res) => {
    const result = await pool.query(
      "DELETE FROM applications WHERE id=$1 AND user_id=$2 RETURNING id",
      [req.params.id, req.session.userId],
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Application not found." });
    res.json({ ok: true });
  });
  return router;
}
