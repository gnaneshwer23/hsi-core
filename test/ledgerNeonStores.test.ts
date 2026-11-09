import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {HSI_STAGING_HOST_PREFIX} from "../src/db/neonGuard";
import {
  assessLedgerNeonWriteGateSamples,
  assertLedgerNeonReadable,
  assertLedgerNeonWritable,
} from "../src/db/ledgerNeonWriteGate";
import {evidenceLedgerRecordFromNeonRow} from "../src/db/evidenceLedgerStore";
import {experimentLedgerRecordFromNeonRow} from "../src/db/experimentLedgerStore";
import {parseEvidenceLedger, parseEvidenceLedgerRecord} from "../src/evidence/evidenceLedger";
import {parseExperimentLedger, parseExperimentLedgerRecord} from "../src/evidence/experimentLedger";

const root = resolve(import.meta.dir, "..");

describe("Neon ledger R/W helpers write-gate (audit Phase #7 companion)", () => {
  test("honesty samples: staging enable, production refuse, autumn-snow refuse", () => {
    const samples = assessLedgerNeonWriteGateSamples();
    expect(samples.stagingWritesEnabled).toBe(true);
    expect(samples.productionWritesRefused).toBe(true);
    expect(samples.writesDisabledRefused).toBe(true);
    expect(samples.autumnSnowRefused).toBe(true);
  });

  test("readable accepts HSI production host; writable requires staging + writesEnabled", () => {
    const productionUrl =
      "postgresql://test:never-used@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
    const stagingUrl =
      "postgresql://test:never-used@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
    expect(assertLedgerNeonReadable({databaseUrl: productionUrl}).hostPrefix).toBe("ep-hsi-production");
    expect(assertLedgerNeonWritable({databaseUrl: stagingUrl, writesEnabled: true}).hostPrefix).toBe(
      HSI_STAGING_HOST_PREFIX,
    );
    expect(() => assertLedgerNeonWritable({databaseUrl: productionUrl, writesEnabled: true})).toThrow(
      "staging host",
    );
    expect(() => assertLedgerNeonWritable({databaseUrl: stagingUrl, writesEnabled: false})).toThrow(
      "writesEnabled=false",
    );
  });

  test("maps offline N2 fixture records through Neon row round-trip shape", () => {
    const ledger = parseEvidenceLedger(
      JSON.parse(readFileSync(resolve(root, "research/domain-graph/n2/ledger.v1.json"), "utf8")),
    );
    const live = ledger.records[0]!;
    const parsed = parseEvidenceLedgerRecord(live);
    const roundTrip = evidenceLedgerRecordFromNeonRow({
      id: parsed.id,
      version: parsed.version,
      parent_version: parsed.parentVersion,
      assertion_kind: parsed.assertionKind,
      assertion: parsed.assertion,
      subject_id: parsed.subjectId,
      predicate: parsed.predicate,
      object_id: parsed.objectId,
      context: parsed.context,
      lineage: parsed.lineage,
      status: parsed.status,
      prediction_freeze: parsed.predictionFreeze,
      observation_protocol: parsed.observationProtocol,
      legacy_epistemic_type: parsed.legacyEpistemicType,
      scientific_approval: false,
      graph_promotable: false,
      claim_entailment_assessed: false,
      content_hash: parsed.contentHash,
      created_at: parsed.createdAt,
      archived_at: null,
    });
    expect(roundTrip.contentHash).toBe(parsed.contentHash);
    expect(roundTrip.scientificApproval).toBe(false);
    expect(roundTrip.claimEntailmentAssessed).toBe(false);
  });

  test("maps offline N7 fixture records through Neon row round-trip shape", () => {
    const ledger = parseExperimentLedger(
      JSON.parse(readFileSync(resolve(root, "research/domain-graph/n7/ledger.v1.json"), "utf8")),
    );
    const live = ledger.records[0]!;
    const parsed = parseExperimentLedgerRecord(live);
    const roundTrip = experimentLedgerRecordFromNeonRow({
      id: parsed.id,
      version: parsed.version,
      parent_version: parsed.parentVersion,
      lifecycle: parsed.lifecycle,
      data_basis: parsed.dataBasis,
      fixture_honesty: parsed.fixtureHonesty,
      programme: parsed.programme,
      prediction: parsed.prediction,
      protocol: parsed.protocol,
      raw_artifacts: parsed.rawArtifacts,
      processing: parsed.processing,
      qc: parsed.qc,
      outcome: parsed.outcome,
      review_candidate: parsed.reviewCandidate,
      frozen_eval_pins: parsed.frozenEvalPins,
      scientific_approval: false,
      graph_promotable: false,
      real_observation_claimed: false,
      content_hash: parsed.contentHash,
      created_at: parsed.createdAt,
      archived_at: null,
    });
    expect(roundTrip.contentHash).toBe(parsed.contentHash);
    expect(roundTrip.realObservationClaimed).toBe(false);
    expect(roundTrip.fixtureHonesty).toBe(true);
  });
});
