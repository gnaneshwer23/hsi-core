import {describe, expect, it} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  appendLedgerRecord,
  draftFindingFromN1Match,
  emptyEvidenceLedger,
  listLedgerLineage,
  mapLegacyEpistemicToAssertionKind,
  parseEvidenceLedger,
  readLedgerRecord,
  supersedeLedgerRecord,
  type LedgerRecordInput,
} from "../src/evidence/evidenceLedger";

const root = resolve(import.meta.dir, "..");
const fixturePath = resolve(root, "research/domain-graph/n2/ledger.v1.json");

function baseFinding(overrides: Partial<LedgerRecordInput> = {}): LedgerRecordInput {
  return {
    id: "N2-TEST-FINDING",
    assertionKind: "reported_finding",
    assertion: "Fixture reported finding for ledger tests.",
    subjectId: "metabolite:butyrate",
    predicate: "associated_with",
    objectId: "phenotype:insulin_sensitivity",
    context: {
      model: "mouse",
      species: null,
      tissue: null,
      population: null,
      assay: null,
      dose: null,
      doseUnit: null,
      timepoint: null,
      intervention: null,
      outcome: "insulin sensitivity",
      missingFields: ["species", "tissue", "population", "assay", "dose", "doseUnit", "timepoint", "intervention"],
    },
    lineage: {
      sourceId: "doi:10.2337/db08-1637",
      passageIds: [],
      methodId: null,
      n1QueueId: "N1-C-01",
      n1Outcome: "metadata_matched_unreviewed",
    },
    predictionFreeze: null,
    observationProtocol: null,
    legacyEpistemicType: "observational_association",
    createdAt: "2026-11-07T21:30:00.000Z",
    ...overrides,
  };
}

describe("N2 evidence ledger kinds", () => {
  it("maps legacy epistemic labels without collapsing N2 kinds", () => {
    expect(mapLegacyEpistemicToAssertionKind("observational_association")).toBe("reported_finding");
    expect(mapLegacyEpistemicToAssertionKind("computational_inference")).toBe("prediction");
    expect(mapLegacyEpistemicToAssertionKind("hypothesis")).toBe("hypothesis");
    expect(mapLegacyEpistemicToAssertionKind("experimental_finding")).toBe("experimental_observation");
  });

  it("keeps finding, prediction, hypothesis and experimental_observation distinct in storage", () => {
    const fixture = parseEvidenceLedger(JSON.parse(readFileSync(fixturePath, "utf8")));
    const kinds = new Set(fixture.records.map((r) => r.assertionKind));
    expect(kinds.has("reported_finding")).toBe(true);
    expect(kinds.has("prediction")).toBe(true);
    expect(kinds.has("hypothesis")).toBe(true);
    expect(kinds.has("experimental_observation")).toBe(true);
    expect(fixture.scientificApproval).toBe(false);
    expect(fixture.graphPromotable).toBe(false);
    expect(fixture.claimEntailmentAssessed).toBe(false);
  });
});

describe("N2 fail-closed validation", () => {
  it("rejects a reported_finding built from an N1 identity mismatch", () => {
    expect(() =>
      draftFindingFromN1Match({
        id: "N2-BAD",
        assertion: "should fail",
        subjectId: "a",
        predicate: "associated_with",
        objectId: "b",
        sourceId: "doi:10.1038/nature21492",
        n1QueueId: "N1-C-02",
        n1Outcome: "identity_mismatch",
        model: "mouse",
        outcome: null,
        createdAt: "2026-11-07T21:30:00.000Z",
      }),
    ).toThrow(/matched N1 metadata/);
  });

  it("rejects missing dose/assay context that is not declared missing", () => {
    const bad = baseFinding({
      context: {
        model: "mouse",
        species: null,
        tissue: null,
        population: null,
        assay: null,
        dose: null,
        doseUnit: null,
        timepoint: null,
        intervention: null,
        outcome: "insulin sensitivity",
        missingFields: ["species"],
      },
    });
    expect(() => appendLedgerRecord(emptyEvidenceLedger(), bad)).toThrow(/must be listed in missingFields/);
  });

  it("rejects prediction with an attached observation protocol", () => {
    const prediction: LedgerRecordInput = {
      id: "N2-TEST-PRED",
      assertionKind: "prediction",
      assertion: "Frozen prediction must not smuggle a result.",
      subjectId: "metabolite:butyrate",
      predicate: "associated_with",
      objectId: "process:inflammation",
      context: {
        model: "organoid",
        species: "human",
        tissue: null,
        population: null,
        assay: null,
        dose: null,
        doseUnit: null,
        timepoint: null,
        intervention: "butyrate",
        outcome: "markers",
        missingFields: ["tissue", "population", "assay", "dose", "doseUnit", "timepoint"],
      },
      lineage: {
        sourceId: null,
        passageIds: [],
        methodId: "method:x",
        n1QueueId: null,
        n1Outcome: null,
      },
      predictionFreeze: {
        frozenAt: "2026-11-07T21:30:00.000Z",
        outcomeUnknown: true,
        falsifier: "No change versus vehicle.",
      },
      observationProtocol: {protocolId: "protocol:x", measuredAt: null, qcStatus: "not_run"},
      legacyEpistemicType: "computational_inference",
      createdAt: "2026-11-07T21:30:00.000Z",
    };
    expect(() => appendLedgerRecord(emptyEvidenceLedger(), prediction)).toThrow(/cannot attach a measured observation/);
  });

  it("rejects invented scientific approval flags", () => {
    const ledger = appendLedgerRecord(emptyEvidenceLedger(), baseFinding());
    expect(() => parseEvidenceLedger({...ledger, scientificApproval: true})).toThrow();
  });

  it("rejects hypothesis that claims an experimental observation", () => {
    const hypothesis: LedgerRecordInput = {
      id: "N2-TEST-HYP",
      assertionKind: "hypothesis",
      assertion: "Unvalidated hypothesis.",
      subjectId: "process:scfa",
      predicate: "associated_with",
      objectId: "phenotype:t2d",
      context: {
        model: null,
        species: null,
        tissue: null,
        population: null,
        assay: null,
        dose: null,
        doseUnit: null,
        timepoint: null,
        intervention: null,
        outcome: null,
        missingFields: [
          "model",
          "species",
          "tissue",
          "population",
          "assay",
          "dose",
          "doseUnit",
          "timepoint",
          "intervention",
          "outcome",
        ],
      },
      lineage: {sourceId: null, passageIds: [], methodId: null, n1QueueId: null, n1Outcome: null},
      predictionFreeze: null,
      observationProtocol: {protocolId: "protocol:x", measuredAt: null, qcStatus: "not_run"},
      legacyEpistemicType: "hypothesis",
      createdAt: "2026-11-07T21:30:00.000Z",
    };
    expect(() => appendLedgerRecord(emptyEvidenceLedger(), hypothesis)).toThrow(/cannot claim an experimental observation/);
  });
});

describe("N2 version lineage", () => {
  it("archives prior versions and preserves read-by-version", () => {
    let ledger = appendLedgerRecord(emptyEvidenceLedger(), baseFinding());
    ledger = supersedeLedgerRecord(ledger, "N2-TEST-FINDING", {
      ...baseFinding(),
      assertion: "Updated finding text; lineage retained.",
      createdAt: "2026-11-07T21:40:00.000Z",
    });
    const live = readLedgerRecord(ledger, "N2-TEST-FINDING");
    const v1 = readLedgerRecord(ledger, "N2-TEST-FINDING", 1);
    expect(live.version).toBe(2);
    expect(live.parentVersion).toBe(1);
    expect(v1.version).toBe(1);
    expect(v1.status).toBe("superseded");
    expect(listLedgerLineage(ledger, "N2-TEST-FINDING").map((r) => r.version)).toEqual([1, 2]);
  });

  it("loads the committed N2 fixture with finding→source lineage", () => {
    const fixture = parseEvidenceLedger(JSON.parse(readFileSync(fixturePath, "utf8")));
    const finding = fixture.records.find((r) => r.assertionKind === "reported_finding")!;
    expect(finding.lineage.sourceId).toBe("doi:10.2337/db08-1637");
    expect(finding.lineage.n1QueueId).toBe("N1-C-01");
    expect(finding.version).toBe(2);
    expect(fixture.archives.some((r) => r.id === finding.id && r.version === 1)).toBe(true);
  });
});
