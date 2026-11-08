import {describe, expect, it} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {parseCrossrefWorksLicencePayload} from "../src/evidence/crossrefWorksLicenceLookup";
import {
  assertN1AttestationNotCleared,
  buildN1LicenceLookupAssist,
  loadCrossrefFixtureLookup,
  parseN1LicenceLookupAssist,
  reportN1AttestationCompleteness,
} from "../src/evidence/n1LicenceLookupAssist";
import {parseN1PassageRightsInventory} from "../src/evidence/n1PassageRightsInventory";
import {parseN1AttestationWorksheet} from "../src/ops/humanQueueResidualPrep";

const root = resolve(import.meta.dir, "..");
const n1Dir = resolve(root, "research/domain-graph/n1");
const fixturesDir = resolve(n1Dir, "fixtures");
const generatedAt = "2026-11-08T22:00:00.000Z";

function loadLookups() {
  const inventory = parseN1PassageRightsInventory(
    JSON.parse(readFileSync(resolve(n1Dir, "rights-inventory.v1.json"), "utf8")),
  );
  const lookups = Object.fromEntries(
    inventory.entries.map((entry) => [
      entry.queueId,
      loadCrossrefFixtureLookup({
        queueId: entry.queueId,
        doi: entry.doi,
        bodyText: readFileSync(
          resolve(fixturesDir, `${entry.queueId.toLowerCase().replace(/-/g, "_")}.crossref.json`),
          "utf8",
        ),
        retrievedAt: generatedAt,
      }),
    ]),
  );
  return {inventory, lookups};
}

describe("N1 licence lookup assist (#2 rights eng-assist)", () => {
  it("records factual Crossref licence URLs without clearing attestation", () => {
    const {inventory, lookups} = loadLookups();
    const assist = buildN1LicenceLookupAssist({inventory, lookups, generatedAt});
    parseN1LicenceLookupAssist(assist);

    expect(assist.rows).toHaveLength(12);
    expect(assist.rightsCleared).toBe(false);
    expect(assist.humanCleared).toBe(0);
    expect(assist.passageImported).toBe(0);
    expect(assist.engPhaseStatus).toBe("IN_PROGRESS_ENG_ASSIST");
    expect(assist.summary.stillNeedsHumanPrincipal).toBe(12);
    expect(assist.rows.every((r) => r.humanRequired)).toBe(true);
    expect(assist.rows.every((r) => r.humanAttestationRequired.licenceEvidenceUri === null)).toBe(
      true,
    );
    expect(assist.rows.every((r) => r.engLookup.filledBy === "engineering")).toBe(true);

    const byId = Object.fromEntries(assist.rows.map((r) => [r.queueId, r]));
    expect(byId["N1-C-01"]?.engLookup.status).toBe("candidate_uri_observed");
    expect(byId["N1-C-01"]?.engLookup.candidateEvidenceUrls).toContain(
      "https://creativecommons.org/licenses/by-nc-nd/3.0/",
    );
    expect(byId["N1-C-07"]?.engLookup.status).toBe("candidate_uri_observed");
    expect(byId["N1-C-12"]?.engLookup.status).toBe("cc_uri_under_tdm_only");
    expect(byId["N1-C-12"]?.engLookup.creativeCommonsUrlsUnderTdmOnly.some((u) =>
      u.includes("creativecommons.org/licenses/by/4.0"),
    )).toBe(true);
    expect(byId["N1-C-08"]?.engLookup.doiRedirected).toBe(true);
    expect(assist.summary.factualCandidateUriObserved).toBeGreaterThanOrEqual(2);
    expect(assist.summary.factualCandidateUriObserved).toBeLessThan(12);
  });

  it("fail-closed completeness gate does not treat empty/partial as approved", () => {
    const {inventory, lookups} = loadLookups();
    const assist = buildN1LicenceLookupAssist({inventory, lookups, generatedAt});
    const worksheet = parseN1AttestationWorksheet(
      JSON.parse(readFileSync(resolve(n1Dir, "attestation-worksheet.v1.json"), "utf8")),
    );
    const report = reportN1AttestationCompleteness({worksheet, assist});
    assertN1AttestationNotCleared(report);
    expect(report.gate).toBe("FAIL_CLOSED_INCOMPLETE");
    expect(report.incompleteIsNotCleared).toBe(true);
    expect(report.rightsCleared).toBe(false);
    expect(report.incompleteRows).toHaveLength(12);
    expect(report.attested).toBe(0);
  });

  it("rejects invented rightsCleared or human attestation on assist pack", () => {
    const {inventory, lookups} = loadLookups();
    const assist = buildN1LicenceLookupAssist({inventory, lookups, generatedAt});
    expect(() =>
      parseN1LicenceLookupAssist({
        ...assist,
        rightsCleared: true,
        assistHash: "deadbeef",
      }),
    ).toThrow(/clearance|passage/i);

    const bad = structuredClone(assist) as typeof assist;
    bad.rows[0]!.humanAttestationRequired.licenceEvidenceUri =
      "https://creativecommons.org/licenses/by/4.0/" as unknown as null;
    bad.assistHash = "deadbeef";
    expect(() => parseN1LicenceLookupAssist(bad)).toThrow(/attestation/i);
  });

  it("does not invent versioned CC URI from Europe PMC unversioned label alone", () => {
    const body = JSON.stringify({
      status: "ok",
      message: {
        DOI: "10.1038/s41586-018-0620-2",
        publisher: "Springer",
        title: ["x"],
        license: [],
      },
    });
    const parsed = parseCrossrefWorksLicencePayload({
      requestedDoi: "10.1038/s41586-018-0620-2",
      bodyText: body,
      retrievedAt: generatedAt,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.candidateEvidenceUrls).toEqual([]);
    expect(parsed.hasEmptyLicenceArray).toBe(true);
  });
});
