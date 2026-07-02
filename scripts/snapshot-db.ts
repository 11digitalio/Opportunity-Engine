import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const sourcePath = process.env.OPPORTUNITY_ENGINE_DB_PATH ?? path.join(process.cwd(), "data", "opportunity-engine.db");
const seedDir = path.join(process.cwd(), "data", "seed");
const seedPath = path.join(seedDir, "opportunity-engine.db");

async function snapshot() {
  if (!fs.existsSync(sourcePath)) throw new Error(`Source database not found: ${sourcePath}`);
  fs.mkdirSync(seedDir, { recursive: true });

  const source = new Database(sourcePath, { readonly: true });
  try {
    await source.backup(seedPath);
  } finally {
    source.close();
  }

  const verify = new Database(seedPath, { readonly: true });
  try {
    const integrity = verify.pragma("integrity_check", { simple: true });
    if (integrity !== "ok") throw new Error(`Seed database integrity check failed: ${integrity}`);
  } finally {
    verify.close();
  }

  console.log(`Seed snapshot updated: ${seedPath}`);
}

snapshot().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
