import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assessSec02ModelGate,
  assertSec02CatalogSoftLand,
  sec02ControlByKind,
  sec02KillSwitchCatalog,
  type Sec02ControlKind,
} from "../src/operations/sec02KillSwitchCatalog";

describe("SEC-02 kill switch catalog (A1.2 soft-land)", () => {
  test("documents six controls without inventing owner or console caps", () => {
    const catalog = sec02KillSwitchCatalog();
    const summary = assertSec02CatalogSoftLand(catalog);
    expect(summary.controlCount).toBe(6);
    expect(summary.ownerCapsClaimed).toBe(false);
    expect(summary.providerConsoleCapsClaimed).toBe(false);
    expect(catalog.scientificApproval).toBe(false);
  });

  test("each control keeps honesty flags and SEC-02 pack ref", () => {
    const kinds: Sec02ControlKind[] = [
      "live_model_step_enable",
      "live_model_daily_runs",
      "rehearsal_kill",
      "capability_kill",
      "pilot_provider_switch",
      "provider_console_spend_cap",
    ];
    for (const kind of kinds) {
      const control = sec02ControlByKind(kind);
      expect(control.kind).toBe(kind);
      expect(control.packRef).toBe("SEC-02");
      expect(control.numericCapInvented).toBe(false);
      expect(control.onCallInvented).toBe(false);
      expect(control.failClosedBehaviour.length).toBeGreaterThan(0);
    }
  });

  test("assessor fail-closes when model step is not explicitly enabled", () => {
    const off = assessSec02ModelGate({});
    expect(off.mayStartModelCheckedRun).toBe(false);
    expect(off.killEngaged).toBe(true);
    expect(off.ownerCapsInvented).toBe(false);
    expect(off.providerConsoleCapsRecorded).toBe(false);

    const on = assessSec02ModelGate({
      HSI_LIVE_MODEL_STEP_ENABLED: "true",
      HSI_LIVE_MODEL_DAILY_RUNS: "25",
    });
    expect(on.mayStartModelCheckedRun).toBe(true);
    expect(on.killEngaged).toBe(false);
    expect(on.ownerDailyCapSet).toBe(true);
    expect(on.providerConsoleCapsRecorded).toBe(false);
  });

  test("staging worksheet stays blocked with null cap values", () => {
    const path = join(import.meta.dir, "../operations/staging/sec02-caps-dry-run.pending.json");
    const sheet = JSON.parse(readFileSync(path, "utf8")) as {
      opsAcceptance: string;
      ownerCapsClaimed: boolean;
      providerConsoleCapsClaimed: boolean;
      honesty: {noInventedNumericCaps: boolean};
      controls: Array<{kind: string; ceilingValue: null | number; ackRef?: null | string}>;
    };
    expect(sheet.opsAcceptance).toBe("BLOCKED");
    expect(sheet.ownerCapsClaimed).toBe(false);
    expect(sheet.providerConsoleCapsClaimed).toBe(false);
    expect(sheet.honesty.noInventedNumericCaps).toBe(true);
    expect(sheet.controls).toHaveLength(3);
    for (const c of sheet.controls) {
      if ("ceilingValue" in c) expect(c.ceilingValue).toBeNull();
      if ("ackRef" in c) expect(c.ackRef).toBeNull();
    }
  });

  test("soft-land doc names SEC-02 and non-claims", () => {
    const doc = readFileSync(
      join(import.meta.dir, "../docs/engineering/A1_2_SEC02_KILL_SWITCH_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("SEC-02");
    expect(doc).toContain("HSI_LIVE_MODEL_STEP_ENABLED");
    expect(doc).toContain("HSI_LIVE_MODEL_DAILY_RUNS");
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("owner-pending");
  });
});
