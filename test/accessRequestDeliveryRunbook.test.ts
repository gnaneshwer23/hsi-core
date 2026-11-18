import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";

describe("PR-E2E-01c access-request delivery runbook", () => {
  test("runbook states honesty and non-goals", () => {
    const doc = readFileSync(
      join(import.meta.dir, "../docs/engineering/ACCESS_REQUEST_DELIVERY_RUNBOOK.md"),
      "utf8",
    );
    expect(doc).toContain("PR-E2E-01c");
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("browser draft only");
    expect(doc).toContain("never claim delivery");
    expect(doc).toContain("ACCESS_REQUEST_NOT_CONFIGURED");
    expect(doc).toContain("DELIVERY_FAILED");
    expect(doc).toContain("operatorReceiptClaimed");
    expect(doc).toContain("Gate C auto-approve");
    expect(doc).toContain("4000 bytes");
    expect(doc).toContain("process-local");
    expect(doc).toContain("fresh");
    expect(doc).not.toMatch(/production delivery (is |was )?live/i);
  });

  test("staging worksheet stays fail-closed until filled", () => {
    const path = join(
      import.meta.dir,
      "../operations/staging/access-request-dry-run.pending.json",
    );
    const sheet = JSON.parse(readFileSync(path, "utf8")) as {
      schemaVersion: string;
      opsAcceptance: string;
      deliveryConfiguredOnStaging: boolean;
      operatorReceiptClaimed: boolean;
      productionDeliveryClaimed: boolean;
      grantsOrWritesImplied: boolean;
      honesty: Record<string, boolean>;
      summary: {stagingDryRunComplete: boolean; productionDelivery: string};
      references: {privateReceiptUri: string | null};
    };
    expect(sheet.schemaVersion).toBe("hsi-access-request-dry-run-1");
    expect(sheet.opsAcceptance).toBe("BLOCKED");
    expect(sheet.deliveryConfiguredOnStaging).toBe(false);
    expect(sheet.operatorReceiptClaimed).toBe(false);
    expect(sheet.productionDeliveryClaimed).toBe(false);
    expect(sheet.grantsOrWritesImplied).toBe(false);
    expect(sheet.honesty.noFakeDeliverySuccess).toBe(true);
    expect(sheet.honesty.noSecretsInGit).toBe(true);
    expect(sheet.honesty.enquiryDoesNotEnableWrites).toBe(true);
    expect(sheet.summary.stagingDryRunComplete).toBe(false);
    expect(sheet.summary.productionDelivery).toBe("not_invented");
    expect(sheet.references.privateReceiptUri).toBeNull();
  });
});
