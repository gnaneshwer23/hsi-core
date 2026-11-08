import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {checkSyntheticE2eFixture} from "../scripts/check-synthetic-e2e-fixture";

const root = resolve(import.meta.dir, "..");
const fixtureDir = resolve(root, "research/fixtures/hsi-synthetic-e2e");

describe("synthetic e2e contract pin", () => {
  test("pinned hashes and honesty fields pass check", () => {
    const result = checkSyntheticE2eFixture();
    expect(result.ok).toBe(true);
    expect(result.label).toBe("e2e-fixture");
    expect(result.packVersion).toBe("hsi-fixture-1.0.0");
    expect(result.seed).toBe(20261106);
    expect(result.pinnedFiles).toBe(10);
  });

  test("sample responses keep synthetic banner and null confidence", () => {
    for (const name of [
      "sample_response.json",
      "sample_response_excluded.json",
      "sample_response_needs_review.json",
    ] as const) {
      const body = JSON.parse(readFileSync(resolve(fixtureDir, "outputs", name), "utf8")) as {
        synthetic: boolean;
        ui_state: string;
        synthetic_notice: string;
        confidence: {value: null | number};
        trial_screening: {notice: string; status: string};
      };
      expect(body.synthetic).toBe(true);
      expect(body.ui_state).toBe("ready_synthetic");
      expect(body.synthetic_notice).toContain("Wholly synthetic");
      expect(body.confidence.value).toBeNull();
      expect(body.trial_screening.notice).toContain("not confirmed eligibility");
      expect(body.trial_screening.notice).toContain("SYNTHETIC_ONLY");
    }
  });

  test("MANIFEST pin digests match on-disk bytes", () => {
    const manifest = JSON.parse(readFileSync(resolve(fixtureDir, "MANIFEST.json"), "utf8")) as {
      pin: Record<string, {sha256: string}>;
    };
    for (const [rel, pin] of Object.entries(manifest.pin)) {
      const digest = createHash("sha256")
        .update(readFileSync(resolve(fixtureDir, rel)))
        .digest("hex");
      expect(digest).toBe(pin.sha256);
    }
  });

  test("api contract remains synthetic-only and not an HTTP service", () => {
    const contract = JSON.parse(readFileSync(resolve(fixtureDir, "api_contract.json"), "utf8")) as {
      "x-synthetic-only": boolean;
      info: {title: string};
    };
    expect(contract["x-synthetic-only"]).toBe(true);
    expect(contract.info.title.toLowerCase()).toContain("not implemented");
  });
});
