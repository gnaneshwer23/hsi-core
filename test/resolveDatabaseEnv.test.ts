import { expect, it } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadLocalEnv } from "../src/db/resolveDatabaseUrl";
it("prefers runtime settings, then .env.local, then .env without mutating the caller", () => {
  const cwd = mkdtempSync(join(tmpdir(), "hsi-env-test-"));
  try {
    writeFileSync(join(cwd, ".env"), "DATABASE_URL=base-fixture\nNEON_PROJECT_ID=base-project\n");
    writeFileSync(join(cwd, ".env.local"), "DATABASE_URL=local-fixture\n");
    const original = { DATABASE_URL: "runtime-fixture" };
    expect(loadLocalEnv(cwd, {}).DATABASE_URL).toBe("local-fixture");
    expect(loadLocalEnv(cwd, original).DATABASE_URL).toBe("runtime-fixture");
    expect(original).toEqual({ DATABASE_URL: "runtime-fixture" });
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
