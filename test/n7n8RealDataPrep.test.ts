import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildN7N8RealDataPrep,
  parseN7N8RealDataPrep,
} from "../src/evidence/n7n8RealDataPrep";

const root = resolve(import.meta.dir, "..");

describe("N7/N8 real-data prep (audit Phase #10)", () => {
  test("builds eng-CLEARED prep with science NO-GO and empty real-data slots", () => {
    const prep = buildN7N8RealDataPrep({
      generatedAt: "2026-11-08T13:00:00.000Z",
    });
    expect(prep.engineeringScaffold).toBe("CLEARED");
    expect(prep.scientificAcceptance).toBe("BLOCKED");
    expect(prep.nearTermGoNoGo).toBe("NO_GO");
    expect(prep.auditRank).toBe(10);
    expect(prep.summary.realDataSlotsFilled).toBe(0);
    expect(prep.n7.realObservationClaimed).toBe(false);
    expect(prep.n7.realObservationGoNoGo).toBe("NO_GO");
    expect(prep.n8.modelActivationAllowed).toBe(false);
    expect(prep.n8.liveProviderCalled).toBe(false);
    expect(prep.n8.liveModelGoNoGo).toBe("NO_GO");
    expect(prep.realDataSlots.every((s) => s.organisationName === null)).toBe(true);
    expect(prep.realDataSlots.every((s) => s.attested === false)).toBe(true);
    expect(prep.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED")).toBe(
      true,
    );
    expect(
      prep.checks
        .filter((c) => c.plane === "human")
        .every((c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED"),
    ).toBe(true);
    expect(prep.stopNote).toContain("human residuals");
    expect(parseN7N8RealDataPrep(prep).prepHash).toBe(prep.prepHash);
  });

  test("pins offline N7/N8 STATUS honesty", () => {
    const n7 = JSON.parse(
      readFileSync(resolve(root, "research/domain-graph/n7/STATUS.json"), "utf8"),
    ) as Record<string, unknown>;
    const n8 = JSON.parse(
      readFileSync(resolve(root, "research/domain-graph/n8/STATUS.json"), "utf8"),
    ) as Record<string, unknown>;
    expect(n7.engineeringHarness).toBe("CLEARED");
    expect(n7.realObservationAcceptance).toBe("BLOCKED");
    expect(n7.realObservationClaimed).toBe(false);
    expect(n8.engineeringHarness).toBe("CLEARED");
    expect(n8.scientificAcceptance).toBe("BLOCKED");
    expect(n8.modelActivationAllowed).toBe(false);
    expect(n8.liveProviderCalled).toBe(false);
  });

  test("refuses invented partner / licence fields in slots", () => {
    const prep = buildN7N8RealDataPrep({
      generatedAt: "2026-11-08T13:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep;
    bad.realDataSlots[0]!.organisationName = "Invented Lab Ltd" as unknown as null;
    expect(() => parseN7N8RealDataPrep(bad)).toThrow("invent partner data");
  });

  test("refuses claiming scientificAcceptance CLEARED or realObservation true", () => {
    const prep = buildN7N8RealDataPrep({
      generatedAt: "2026-11-08T13:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep & {scientificAcceptance: string};
    bad.scientificAcceptance = "CLEARED";
    expect(() => parseN7N8RealDataPrep(bad)).toThrow();
  });

  test("refuses attested=true on empty slots", () => {
    const prep = buildN7N8RealDataPrep({
      generatedAt: "2026-11-08T13:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep;
    bad.realDataSlots[3]!.attested = true as unknown as false;
    expect(() => parseN7N8RealDataPrep(bad)).toThrow("invent partner data");
  });

  test("refuses CLEARED human checks", () => {
    const prep = buildN7N8RealDataPrep({
      generatedAt: "2026-11-08T13:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep;
    const human = bad.checks.find((c) => c.plane === "human");
    expect(human).toBeDefined();
    human!.status = "CLEARED";
    // Re-seal so hash matches body; parse should still refuse CLEARED human checks.
    const {prepHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      prepHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseN7N8RealDataPrep(sealed)).toThrow("cannot be CLEARED");
  });

  test("on-disk prep packet matches rebuild", () => {
    const onDisk = parseN7N8RealDataPrep(
      JSON.parse(
        readFileSync(resolve(root, "research/domain-graph/n7n8/real-data-prep.v1.json"), "utf8"),
      ),
    );
    const rebuilt = buildN7N8RealDataPrep({generatedAt: onDisk.generatedAt});
    expect(onDisk.prepHash).toBe(rebuilt.prepHash);
  });
});
