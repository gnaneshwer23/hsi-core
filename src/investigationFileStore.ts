/** Local research runner persistence. Product APIs must use their own tenant-scoped database adapter. */
import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { InvestigationConflictError, validateInvestigationSnapshot, type InvestigationStore, type StoredInvestigation } from "./investigationService";

export function createFileInvestigationStore(directory: string): InvestigationStore {
  const root = resolve(directory);
  const file = (key: string) => resolve(root, `${createHash("sha256").update(key).digest("hex")}.json`);
  async function load(key: string): Promise<StoredInvestigation | null> {
    let raw: string;
    try { raw = await readFile(file(key), "utf8"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
    if (Buffer.byteLength(raw) > 4_000_000) throw new Error("Investigation snapshot exceeds local store limit");
    return validateInvestigationSnapshot(JSON.parse(raw));
  }
  return { load, async save(key, expected, snapshot) {
    validateInvestigationSnapshot(snapshot);
    await mkdir(root, { recursive: true, mode: 0o700 });
    const target = file(key), lockPath = `${target}.lock`;
    let lock;
    try { lock = await open(lockPath, "wx", 0o600); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new InvestigationConflictError(); throw error; }
    const temp = `${target}.${randomUUID()}.tmp`;
    try {
      const current = await load(key);
      if ((current?.revision ?? null) !== expected || snapshot.revision !== (expected ?? 0) + 1) throw new InvestigationConflictError();
      const raw = JSON.stringify(snapshot);
      if (Buffer.byteLength(raw) > 4_000_000) throw new Error("Investigation snapshot exceeds local store limit");
      const handle = await open(temp, "wx", 0o600);
      try { await handle.writeFile(raw); await handle.sync(); } finally { await handle.close(); }
      await rename(temp, target);
    } finally {
      try { await unlink(temp).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; }); }
      finally { try { await lock.close(); } finally { await unlink(lockPath); } }
    }
  } };
}
