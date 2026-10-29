import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env")) {
  console.log(".env already exists. Your settings have not been changed.");
} else {
  const example = readFileSync(".env.example", "utf8");
  writeFileSync(
    ".env",
    example.replace(
      "replace-with-at-least-32-random-characters",
      randomBytes(32).toString("hex"),
    ),
  );
  console.log(
    "Created .env with a random session secret. Add your DATABASE_URL, then run npm run db:migrate.",
  );
}
