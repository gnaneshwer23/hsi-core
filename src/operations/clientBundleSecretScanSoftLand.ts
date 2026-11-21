/**
 * PROD-QA-003 — client-bundle secret scan soft-land.
 *
 * Documents the defensive site/dist scanner and refuses to claim AppSec acceptance.
 */

export const CLIENT_BUNDLE_SECRET_SCAN_SCHEMA =
  "hsi-client-bundle-secret-scan-soft-land-1" as const;

export type ClientBundleSecretScanPacket = {
  schemaVersion: typeof CLIENT_BUNDLE_SECRET_SCAN_SCHEMA;
  purpose: "prod_qa_003_client_bundle_secret_scan";
  backlogId: "PROD-QA-003";
  scientificApproval: false;
  appSecAccepted: false;
  inventedFindings: false;
  scanScriptPath: "scripts/scan-client-bundle-secrets.ts";
  scanCommand: "bun run scan:client-bundle";
  pendingWorksheetPath: "operations/staging/client-bundle-secret-scan.pending.json";
  softLandDocPath: "docs/engineering/CLIENT_BUNDLE_SECRET_SCAN_SOFT_LAND.md";
  honesty: {
    missingDistIsSkipNotPass: true;
    cleanScanIsNotAppSecAcceptance: true;
    gitleaksHistoryStillRequired: true;
    noInventedFindings: true;
  };
};

export function clientBundleSecretScanPacket(): ClientBundleSecretScanPacket {
  return {
    schemaVersion: CLIENT_BUNDLE_SECRET_SCAN_SCHEMA,
    purpose: "prod_qa_003_client_bundle_secret_scan",
    backlogId: "PROD-QA-003",
    scientificApproval: false,
    appSecAccepted: false,
    inventedFindings: false,
    scanScriptPath: "scripts/scan-client-bundle-secrets.ts",
    scanCommand: "bun run scan:client-bundle",
    pendingWorksheetPath: "operations/staging/client-bundle-secret-scan.pending.json",
    softLandDocPath: "docs/engineering/CLIENT_BUNDLE_SECRET_SCAN_SOFT_LAND.md",
    honesty: {
      missingDistIsSkipNotPass: true,
      cleanScanIsNotAppSecAcceptance: true,
      gitleaksHistoryStillRequired: true,
      noInventedFindings: true,
    },
  };
}

export function assertClientBundleSecretScanSoftLand(
  packet: ClientBundleSecretScanPacket,
): {appSecAccepted: false; scientificApproval: false} {
  if (packet.schemaVersion !== CLIENT_BUNDLE_SECRET_SCAN_SCHEMA) {
    throw new Error("unexpected client-bundle secret-scan schema");
  }
  if (packet.backlogId !== "PROD-QA-003") {
    throw new Error("soft-land must bind PROD-QA-003");
  }
  if (packet.appSecAccepted !== false || packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim AppSec or scientific acceptance");
  }
  if (packet.inventedFindings !== false) {
    throw new Error("soft-land must not invent findings");
  }
  return {appSecAccepted: false, scientificApproval: false};
}
