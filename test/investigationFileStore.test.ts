import { test, expect } from "bun:test";
import { mkdtemp, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import fixture from "./fixtures/research-contract.json";
import { createFileInvestigationStore } from "../src/investigationFileStore";
import { createInvestigationService, createCorpusRetrievalProvider, InvestigationConflictError } from "../src/investigationService";
import { researchRunState } from "../src/researchContracts";

test("local file adapter survives service restart and refuses stale or concurrent writes", async () => {
  const root = await mkdtemp(join(tmpdir(), "hsi-run-"));
  try {
    const first = createFileInvestigationStore(root);
    const options = { authorize: async () => ({ id: "fixture-reviewer", role: "reviewer" as const }), providers: { retrieval: createCorpusRetrievalProvider() } };
    const s = await createInvestigationService({ ...options, store: first }).start("fixture", { ...fixture, runs: [] }, null);
    const second = createFileInvestigationStore(root);
    const freshService = createInvestigationService({ ...options, store: second });
    expect(await freshService.get("fixture", null)).toEqual(s);
    await expect(second.save("fixture", null, s)).rejects.toBeInstanceOf(InvestigationConflictError);
    const attempts = await Promise.allSettled([
      first.save("fixture", s.revision, { ...s, revision: s.revision + 1 }),
      second.save("fixture", s.revision, { ...s, revision: s.revision + 1 }),
    ]);
    expect(attempts.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const current = await freshService.get("fixture", null);
    const reviewed = await freshService.review("fixture", current.revision, "request_revision", "Engineering fixture requires real scientific review.", null);
    expect(researchRunState(reviewed.bundle.runs[0]!)).toBe("completed");
    expect((await readdir(root)).every((f) => f.endsWith(".json"))).toBe(true);
    const [filename] = await readdir(root); const path = join(root, filename!);
    const corrupt = JSON.parse(await readFile(path, "utf8")); corrupt.payloads.review.rationale = "tamper";
    await writeFile(path, JSON.stringify(corrupt));
    await expect(second.load("fixture")).rejects.toThrow();
  } finally { await rm(root, { recursive: true, force: true }); }
});
