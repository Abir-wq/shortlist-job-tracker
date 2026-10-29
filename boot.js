
import { execFileSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

console.log("Installing application dependencies...");
execFileSync(npm, ["ci", "--include=dev"], {
  stdio: "inherit",
});

console.log("Building the frontend...");
execFileSync(npm, ["run", "build"], {
  stdio: "inherit",
});

console.log("Running database migrations...");
execFileSync(npm, ["run", "db:migrate"], {
  stdio: "inherit",
});

console.log("Starting Shortlist...");
await import("./server/index.js");
