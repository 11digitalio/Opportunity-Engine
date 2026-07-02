import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

async function reset() {
  for (const file of ["opportunity-engine.db", "opportunity-engine.db-shm", "opportunity-engine.db-wal"]) {
    const target = path.join(dataDir, file);
    if (fs.existsSync(target)) fs.rmSync(target);
  }

  process.env.OPPORTUNITY_ENGINE_SKIP_SEED_SNAPSHOT = "1";
  await import("../lib/db");
  console.log("Database reset and example data restored.");
}

reset().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
