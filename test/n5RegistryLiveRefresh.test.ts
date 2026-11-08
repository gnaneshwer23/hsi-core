import {describe, expect, test} from "bun:test";
import {readFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {
  assertValidNctId,
  parseClinicalTrialsGovStudyPayload,
} from "../src/evidence/clinicalTrialsGovLookup";
import {
  N5_LIVE_REFRESH_NCT_IDS,
  assertLiveRefreshNctPins,
  buildN5LiveRegistrySnapshot,
  parseN5LiveRefreshReceipt,
  parseN5LiveRegistrySnapshot,
  runN5LiveRefreshFromFixtures,
  wrapCtgovStudiesAsImportJson,
} from "../src/evidence/n5RegistryLiveRefresh";

const root = resolve(import.meta.dir, "..");
const fixturesDir = resolve(root, "research/domain-graph/n5/fixtures");
const retrievedAt = "2026-11-08T12:15:00.000Z";
const asOf = "2026-11-08T12:20:00.000Z";
const generatedAt = "2026-11-08T12:20:00.000Z";

function loadBodies(): Record<string, {httpStatus: number; bodyText: string}> {
  const out: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const nctId of N5_LIVE_REFRESH_NCT_IDS) {
    const path = resolve(fixturesDir, `ctgov.live.${nctId.toLowerCase()}.json`);
    expect(existsSync(path)).toBe(true);
    out[nctId] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  return out;
}

describe("N5 live public-registry snapshot refresh (audit #9)", () => {
  test("pins are valid NCT ids", () => {
    const pins = assertLiveRefreshNctPins();
    expect(pins).toEqual(["NCT01030861", "NCT02401880"]);
    for (const id of pins) expect(assertValidNctId(id)).toBe(id);
  });

  test("parses captured CT.gov fixtures without inventing eligibility", () => {
    const bodies = loadBodies();
    for (const nctId of N5_LIVE_REFRESH_NCT_IDS) {
      const parsed = parseClinicalTrialsGovStudyPayload({
        nctId,
        bodyText: bodies[nctId]!.bodyText,
        httpStatus: 200,
        retrievedAt,
      });
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.nctId).toBe(nctId);
        expect(parsed.study.protocolSection).toBeTruthy();
      }
    }
  });

  test("live refresh receipt keeps confirmedEligible=false and sci BLOCKED", () => {
    const {receipt} = runN5LiveRefreshFromFixtures({
      fixtureBodiesByNct: loadBodies(),
      retrievedAt,
      asOf,
      generatedAt,
    });
    const parsed = parseN5LiveRefreshReceipt(receipt);
    expect(parsed.engineeringHarness).toBe("CLEARED");
    expect(parsed.scientificAcceptance).toBe("BLOCKED");
    expect(parsed.confirmedEligible).toBe(false);
    expect(parsed.patientEligible).toBe(false);
    expect(parsed.patientEligibilityAssessed).toBe(false);
    expect(parsed.liveRegistryQueried).toBe(true);
    expect(parsed.liveStatusVerified).toBe(false);
    expect(parsed.enrolmentEnabled).toBe(false);
    expect(parsed.inventedEligibilityPermitted).toBe(false);
    expect(parsed.snapshot.studies).toHaveLength(2);
    for (const report of parsed.reports) {
      expect(report.confirmedEligible).toBe(false);
      expect(report.liveRegistryQueried).toBe(true);
      expect(report.scientificAcceptance).toBe("BLOCKED");
      expect(report.inspections.every((i) => i.confirmedEligible === false)).toBe(true);
    }
  });

  test("refuses inventing confirmedEligible=true on receipt", () => {
    const {receipt} = runN5LiveRefreshFromFixtures({
      fixtureBodiesByNct: loadBodies(),
      retrievedAt,
      asOf,
      generatedAt,
    });
    const bad = structuredClone(receipt) as typeof receipt & {confirmedEligible: boolean};
    bad.confirmedEligible = true;
    expect(() => parseN5LiveRefreshReceipt(bad)).toThrow(/honesty/);
  });

  test("refuses offline-style liveRegistryQueried=false on live snapshot", () => {
    const bodies = loadBodies();
    const studies = N5_LIVE_REFRESH_NCT_IDS.map((nctId) => {
      const parsed = parseClinicalTrialsGovStudyPayload({
        nctId,
        bodyText: bodies[nctId]!.bodyText,
        httpStatus: 200,
        retrievedAt,
      });
      if (!parsed.ok) throw new Error(parsed.detail);
      return parsed.study;
    });
    const snapshot = buildN5LiveRegistrySnapshot({
      retrievedAt,
      asOf,
      clinicalTrialsGovJson: wrapCtgovStudiesAsImportJson(studies),
    });
    const bad = structuredClone(snapshot) as typeof snapshot & {liveRegistryQueried: boolean};
    bad.liveRegistryQueried = false;
    expect(() => parseN5LiveRegistrySnapshot(bad)).toThrow(/honesty/);
  });

  test("on-disk live receipt matches fixture replay rebuild", () => {
    const receiptPath = resolve(
      root,
      "research/domain-graph/n5/receipts/registry.live.receipt.json",
    );
    expect(existsSync(receiptPath)).toBe(true);
    const {receipt} = runN5LiveRefreshFromFixtures({
      fixtureBodiesByNct: loadBodies(),
      retrievedAt,
      asOf,
      generatedAt,
    });
    const onDisk = parseN5LiveRefreshReceipt(JSON.parse(readFileSync(receiptPath, "utf8")));
    expect(onDisk.receiptHash).toBe(receipt.receiptHash);
    expect(onDisk.confirmedEligible).toBe(false);
  });
});
