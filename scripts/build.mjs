// Production build: migrate + seed need a real database, so they are skipped (with a warning)
// when DATABASE_URL is missing, e.g. on a Netlify deploy before the env vars are added.
import { execSync } from "node:child_process";

const run = (command) => execSync(command, { stdio: "inherit" });

if (process.env.DATABASE_URL) {
  run("prisma migrate deploy");
  run("prisma generate");
  run("npm run seed");
} else {
  console.warn("\n⚠ DATABASE_URL is not set: skipping prisma migrate deploy and seed. Pages that use the database will fail until it is added.\n");
  run("prisma generate");
}
run("next build");
