import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { createApp } from "../app.js";
import { testDatabase } from "./database.js";
let pool, app, store, alice, bob, aliceToken, bobToken, saved;
const password = "test-only-password-123";
const mutation = (agent, method, path, token, body) =>
  agent[method](path).set("X-CSRF-Token", token).send(body);
before(async () => {
  pool = await testDatabase();
  const Store = connectPgSimple(session);
  store = new Store({
    pool,
    tableName: "sessions",
    pruneSessionInterval: false,
  });
  app = createApp(pool, {
    secret: "test-secret-with-more-than-thirty-two-characters",
    store,
  });
  alice = request.agent(app);
  bob = request.agent(app);
  aliceToken = (await alice.get("/api/auth/me")).body.csrfToken;
  bobToken = (await bob.get("/api/auth/me")).body.csrfToken;
});
after(async () => {
  store.close();
  await pool.end();
});
test("health, anonymous access and unknown API paths", async () => {
  assert.equal((await request(app).get("/api/health")).status, 200);
  assert.equal((await request(app).get("/api/applications")).status, 401);
  assert.equal((await request(app).get("/api/not-a-route")).status, 404);
});
test("registration rejects missing CSRF and weak passwords", async () => {
  assert.equal(
    (
      await alice
        .post("/api/auth/register")
        .send({ name: "Alice", email: "alice@example.com", password })
    ).status,
    403,
  );
  assert.equal(
    (
      await mutation(alice, "post", "/api/auth/register", aliceToken, {
        name: "Alice",
        email: "alice@example.com",
        password: "weak",
      })
    ).status,
    400,
  );
});
test("register accounts, hash passwords and rotate session tokens", async () => {
  const a = await mutation(alice, "post", "/api/auth/register", aliceToken, {
    name: "Alice",
    email: "Alice@example.com",
    password,
  });
  assert.equal(a.status, 200);
  assert.equal(a.body.user.email, "alice@example.com");
  assert.notEqual(a.body.csrfToken, aliceToken);
  aliceToken = a.body.csrfToken;
  const b = await mutation(bob, "post", "/api/auth/register", bobToken, {
    name: "Bob",
    email: "bob@example.com",
    password,
  });
  assert.equal(b.status, 200);
  bobToken = b.body.csrfToken;
  const user = (
    await pool.query("SELECT password_hash FROM users WHERE email=$1", [
      "alice@example.com",
    ])
  ).rows[0];
  assert.notEqual(user.password_hash, password);
  assert.match(user.password_hash, /^\$2/);
  assert.equal((await alice.get("/api/auth/me")).body.user.name, "Alice");
});
test("duplicate email and invalid login are handled", async () => {
  const guest = request.agent(app);
  const token = (await guest.get("/api/auth/me")).body.csrfToken;
  assert.equal(
    (
      await mutation(guest, "post", "/api/auth/register", token, {
        name: "Other",
        email: "alice@example.com",
        password,
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await mutation(guest, "post", "/api/auth/login", token, {
        email: "alice@example.com",
        password: "incorrect",
      })
    ).status,
    401,
  );
});
test("create an application with safe defaults", async () => {
  const response = await mutation(
    alice,
    "post",
    "/api/applications",
    aliceToken,
    {
      company: "My Company",
      role: "Frontend developer",
      follow_up_date: "2026-12-03",
      job_url: "https://example.com/job",
    },
  );
  assert.equal(response.status, 201);
  saved = response.body;
  assert.equal(saved.prep.length, 5);
  assert.equal(saved.questions.length, 3);
  assert.equal((await alice.get("/api/applications")).body.length, 1);
});
test("another account cannot read, update or delete the application", async () => {
  assert.equal((await bob.get("/api/applications")).body.length, 0);
  assert.equal((await bob.get(`/api/applications/${saved.id}`)).status, 404);
  assert.equal(
    (
      await mutation(
        bob,
        "put",
        `/api/applications/${saved.id}`,
        bobToken,
        saved,
      )
    ).status,
    404,
  );
  assert.equal(
    (await mutation(bob, "delete", `/api/applications/${saved.id}`, bobToken))
      .status,
    404,
  );
});
test("validation rejects script URLs, invalid dates, stages and oversized answers", async () => {
  for (const patch of [
    { job_url: "javascript:alert(1)" },
    { applied_date: "2026-02-30" },
    { status: "Hacked" },
    { company: "" },
    { questions: [{ question: "Why?", answer: "x".repeat(5001) }] },
  ]) {
    const response = await mutation(
      alice,
      "put",
      `/api/applications/${saved.id}`,
      aliceToken,
      { ...saved, ...patch },
    );
    assert.equal(response.status, 400, response.text);
  }
});
test("update persists interview preparation, notes and scheduling", async () => {
  const body = {
    ...saved,
    status: "Interview",
    notes: "A real example to discuss.",
    interview_at: "2026-12-07T09:30:00+01:00",
    prep: saved.prep.map((p, i) => ({ ...p, done: i === 0 })),
    questions: [
      {
        id: "one",
        question: "Why this role?",
        answer: "I enjoy building useful tools.",
      },
    ],
  };
  const response = await mutation(
    alice,
    "put",
    `/api/applications/${saved.id}`,
    aliceToken,
    body,
  );
  assert.equal(response.status, 200);
  saved = response.body;
  const read = (await alice.get(`/api/applications/${saved.id}`)).body;
  assert.equal(read.prep[0].done, true);
  assert.equal(read.questions[0].answer, body.questions[0].answer);
  assert.equal(read.interview_at, "2026-12-07T08:30:00.000Z");
});
test("sample creation is restricted to empty workspaces and clearing samples preserves real entries", async () => {
  assert.equal(
    (await mutation(alice, "post", "/api/applications/samples", aliceToken))
      .status,
    409,
  );
  assert.equal(
    (await mutation(bob, "post", "/api/applications/samples", bobToken)).status,
    201,
  );
  assert.equal((await bob.get("/api/applications")).body.length, 6);
  assert.equal(
    (await mutation(bob, "post", "/api/applications/samples", bobToken)).status,
    409,
  );
  await mutation(bob, "post", "/api/applications", bobToken, {
    company: "Real entry",
    role: "Designer",
  });
  assert.equal(
    (await mutation(bob, "delete", "/api/applications/samples", bobToken))
      .status,
    200,
  );
  const remaining = (await bob.get("/api/applications")).body;
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].company, "Real entry");
});
test("logout removes access and login restores the same saved records", async () => {
  assert.equal(
    (await mutation(alice, "post", "/api/auth/logout", aliceToken)).status,
    200,
  );
  assert.equal((await alice.get("/api/applications")).status, 401);
  aliceToken = (await alice.get("/api/auth/me")).body.csrfToken;
  const response = await mutation(
    alice,
    "post",
    "/api/auth/login",
    aliceToken,
    { email: "alice@example.com", password },
  );
  assert.equal(response.status, 200);
  aliceToken = response.body.csrfToken;
  assert.equal(
    (await alice.get(`/api/applications/${saved.id}`)).body.notes,
    "A real example to discuss.",
  );
});
test("delete only the owned record and handle invalid identifiers", async () => {
  assert.equal((await alice.get("/api/applications/not-a-uuid")).status, 404);
  assert.equal(
    (
      await mutation(
        alice,
        "delete",
        `/api/applications/${saved.id}`,
        aliceToken,
      )
    ).status,
    200,
  );
  assert.equal((await alice.get(`/api/applications/${saved.id}`)).status, 404);
});
test("built React routes support direct requests and refreshes", async () => {
  for (const path of [
    "/",
    "/applications",
    "/applications/new",
    "/interviews",
  ]) {
    const response = await request(app).get(path);
    assert.equal(response.status, 200);
    assert.match(response.text, /<div id="root"><\/div>/);
  }
});

test("production uses secure cookies and a content security policy", async () => {
  const old = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const productionApp = createApp(pool, {
      secret: "test-secret-with-more-than-thirty-two-characters",
      store,
    });
    const response = await request(productionApp)
      .get("/api/auth/me")
      .set("X-Forwarded-Proto", "https");
    assert.equal(response.status, 200);
    assert.match(response.headers["set-cookie"][0], /HttpOnly/);
    assert.match(response.headers["set-cookie"][0], /Secure/);
    assert.match(response.headers["set-cookie"][0], /SameSite=Lax/);
    assert.match(
      response.headers["content-security-policy"],
      /default-src 'self'/,
    );
  } finally {
    if (old === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = old;
  }
});
