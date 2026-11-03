/** Explicitly local synthetic scenario runner, not a product API or production identity provider. */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import fixture from "../../test/fixtures/research-contract.json";
import { createFileInvestigationStore } from "../investigationFileStore";
import { createInvestigationService, createCorpusRetrievalProvider, InvestigationAccessError } from "../investigationService";
import { researchRunState } from "../researchContracts";

const [command, directory, decision, ...reason] = process.argv.slice(2);
if (!["start", "status", "review", "export"].includes(command ?? "") || !directory) {
  throw new Error("Usage: bun run investigation:demo <start|status|review|export> <local-directory> [accept_for_research|request_revision] [review rationale]");
}
const root = resolve(directory), key = "local-synthetic-investigation";
const credential = Symbol("local operator invocation");
const service = createInvestigationService({ store: createFileInvestigationStore(resolve(root, "state")), providers: { retrieval: createCorpusRetrievalProvider() },
  authorize: async (token, _action, requested) => {
    if (token !== credential || requested !== key) throw new InvestigationAccessError();
    return { id: "local-fixture-operator", role: "reviewer" };
  },
});
if (command === "start") {
  const result = await service.start(key, { ...fixture, runs: [] }, credential);
  console.log(JSON.stringify({ mode: "local_synthetic_fixture", state: researchRunState(result.bundle.runs[0]!), revision: result.revision }, null, 2));
} else if (command === "review") {
  if (!["accept_for_research", "request_revision"].includes(decision ?? "") || !reason.join(" ").trim()) throw new Error("Review requires an explicit decision and rationale from the local operator.");
  const current = await service.get(key, credential);
  const result = await service.review(key, current.revision, decision as "accept_for_research" | "request_revision", reason.join(" "), credential);
  console.log(JSON.stringify({ mode: "local_synthetic_fixture", state: researchRunState(result.bundle.runs[0]!), decision: result.payloads.review!.decision }, null, 2));
} else if (command === "export") {
  const result = await service.exportDossier(key, credential); await mkdir(root, { recursive: true, mode: 0o700 });
  await writeFile(resolve(root, "dossier.json"), result.json, { mode: 0o600 });
  await writeFile(resolve(root, "dossier.md"), result.markdown, { mode: 0o600 });
  console.log(`Exported local synthetic dossier to ${root}`);
} else {
  const result = await service.get(key, credential);
  console.log(JSON.stringify({ mode: "local_synthetic_fixture", state: researchRunState(result.bundle.runs[0]!), revision: result.revision }, null, 2));
}
