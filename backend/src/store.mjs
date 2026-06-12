import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = fileURLToPath(new URL("../data", import.meta.url));
const seedPath = join(dataDir, "seed.json");
const dbPath = join(dataDir, "db.json");

async function readJson(path) {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}

export async function loadDb() {
  try {
    return await readJson(dbPath);
  } catch {
    const seed = await readJson(seedPath);
    await saveDb(seed);
    return seed;
  }
}

export async function saveDb(db) {
  await mkdir(dirname(dbPath), { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf-8");
}

export async function updateDb(mutator) {
  const db = await loadDb();
  const result = await mutator(db);
  await saveDb(db);
  return result ?? db;
}
