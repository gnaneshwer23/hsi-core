#!/usr/bin/env bun
/**
 * N2 evidence ledger fixture build/check.
 * Offline only — does not write Neon, invent paper claims, or grant Gate C approval.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {
  appendLedgerRecord,
  draftFindingFromN1Match,
  emptyEvidenceLedger,
  parseEvidenceLedger,
  supersedeLedgerRecord,
  type EvidenceLedger,
  type LedgerRecordInput,
} from "../src/evidence/evidenceLedger";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";

const root = resolve(import.meta.dir, "..");
const outPath = resolve(root, "research/domain-graph/n2/ledger.v1.json");
const check = process.argv.includes("--check");

function buildFixtureLedger(): EvidenceLedger {
  const createdAt = "2026-11-07T21:30:00.000Z";
  let ledger = emptyEvidenceLedger();

  const finding = draftFindingFromN1Match({
    id: "N2-R-001",
    assertion:
      "Butyrate administration was reported to improve insulin sensitivity in a mouse metabolic intervention study (bibliographic candidate; passage not imported).",
    subjectId: "metabolite:butyrate",
    predicate: "associated_with",
    objectId: "phenotype:insulin_sensitivity",
    sourceId: "doi:10.2337/db08-1637",
    n1QueueId: "N1-C-01",
    n1Outcome: "metadata_matched_unreviewed",
    model: "mouse",
    outcome: "Insulin sensitivity and energy expenditure",
    createdAt,
  });
  ledger = appendLedgerRecord(ledger, finding);

  const prediction: LedgerRecordInput = {
    id: "N2-R-002",
    assertionKind: "prediction",
    assertion:
      "Raising luminal butyrate in a matched human gut–immune organoid will reduce inflammatory signalling markers relative to vehicle under a frozen protocol.",
    subjectId: "metabolite:butyrate",
    predicate: "associated_with",
    objectId: "process:inflammatory_signalling",
    context: {
      model: "human gut-immune organoid (proposed)",
      species: "human",
      tissue: "intestinal epithelium / immune co-culture",
      population: null,
      assay: null,
      dose: null,
      doseUnit: null,
      timepoint: null,
      intervention: "butyrate",
      outcome: "inflammatory signalling markers",
      missingFields: ["population", "assay", "dose", "doseUnit", "timepoint"],
    },
    lineage: {
      sourceId: "doi:10.2337/db08-1637",
      passageIds: [],
      methodId: "method:organoid-butyrate-v0",
      n1QueueId: "N1-C-01",
      n1Outcome: "metadata_matched_unreviewed",
    },
    predictionFreeze: {
      frozenAt: createdAt,
      outcomeUnknown: true,
      falsifier: "No reduction (or an increase) in pre-specified inflammatory markers versus vehicle under the frozen protocol.",
    },
    observationProtocol: null,
    legacyEpistemicType: "computational_inference",
    createdAt,
  };
  ledger = appendLedgerRecord(ledger, prediction);

  const hypothesis: LedgerRecordInput = {
    id: "N2-R-003",
    assertionKind: "hypothesis",
    assertion:
      "Gut microbial short-chain fatty acids may modulate host immune tone that contributes to insulin resistance in type 2 diabetes; this remains an unvalidated research hypothesis.",
    subjectId: "process:scfa_signalling",
    predicate: "associated_with",
    objectId: "phenotype:insulin_resistance",
    context: {
      model: null,
      species: null,
      tissue: null,
      population: "adults with type 2 diabetes (unspecified)",
      assay: null,
      dose: null,
      doseUnit: null,
      timepoint: null,
      intervention: null,
      outcome: "insulin resistance",
      missingFields: ["model", "species", "tissue", "assay", "dose", "doseUnit", "timepoint", "intervention"],
    },
    lineage: {
      sourceId: null,
      passageIds: [],
      methodId: null,
      n1QueueId: null,
      n1Outcome: null,
    },
    predictionFreeze: null,
    observationProtocol: null,
    legacyEpistemicType: "hypothesis",
    createdAt,
  };
  ledger = appendLedgerRecord(ledger, hypothesis);

  const observation: LedgerRecordInput = {
    id: "N2-R-004",
    assertionKind: "experimental_observation",
    assertion:
      "Fixture-only observation slot for a protocol-linked measurement. No laboratory result is claimed.",
    subjectId: "metabolite:butyrate",
    predicate: "measured_in",
    objectId: "assay:fixture_slot",
    context: {
      model: "fixture",
      species: "unspecified",
      tissue: null,
      population: null,
      assay: "fixture assay slot",
      dose: null,
      doseUnit: null,
      timepoint: null,
      intervention: null,
      outcome: null,
      missingFields: ["tissue", "population", "dose", "doseUnit", "timepoint", "intervention", "outcome"],
    },
    lineage: {
      sourceId: null,
      passageIds: [],
      methodId: "method:fixture-protocol-v0",
      n1QueueId: null,
      n1Outcome: null,
    },
    predictionFreeze: null,
    observationProtocol: {
      protocolId: "protocol:fixture-v0",
      measuredAt: null,
      qcStatus: "not_run",
    },
    legacyEpistemicType: "experimental_finding",
    createdAt,
  };
  ledger = appendLedgerRecord(ledger, observation);

  // Demonstrate version lineage: refine finding context note without inventing dose/assay.
  ledger = supersedeLedgerRecord(ledger, "N2-R-001", {
    ...finding,
    assertion:
      "Butyrate administration was reported to improve insulin sensitivity in mice (N1 metadata match; exact passage not imported; dose/assay still missing).",
    createdAt: "2026-11-07T21:35:00.000Z",
  });

  return parseEvidenceLedger(ledger);
}

const ledger = buildFixtureLedger();
const serialized = `${JSON.stringify(ledger, null, 2)}\n`;

if (check) {
  const existing = parseEvidenceLedger(JSON.parse(readFileSync(outPath, "utf8")));
  if (canonicalEvidenceJson(existing) !== canonicalEvidenceJson(ledger)) {
    console.error(JSON.stringify({ok: false, error: "N2 ledger fixture is stale; re-run without --check"}, null, 2));
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        path: "research/domain-graph/n2/ledger.v1.json",
        liveRecords: existing.records.length,
        archivedVersions: existing.archives.length,
        kinds: [...new Set(existing.records.map((r) => r.assertionKind))].sort(),
        scientificApproval: false,
      },
      null,
      2,
    ),
  );
} else {
  mkdirSync(dirname(outPath), {recursive: true});
  writeFileSync(outPath, serialized);
  console.log(
    JSON.stringify(
      {
        ok: true,
        wrote: "research/domain-graph/n2/ledger.v1.json",
        liveRecords: ledger.records.length,
        archivedVersions: ledger.archives.length,
      },
      null,
      2,
    ),
  );
}
