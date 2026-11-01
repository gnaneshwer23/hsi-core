/**
 * P3 adapter license gate — refuse run while blockedUntilSignOff=true.
 *
 * Binding: docs/P3_ADAPTER_RFC.md · src/p3AdapterLicenseMatrix.ts.
 * Never invents commercial signed; never flips grades.
 */
import {
  buildP3AdapterLicenseRows,
  type P3AdapterLicenseRow,
} from "./p3AdapterLicenseMatrix";

export class P3AdapterLicenseBlockedError extends Error {
  readonly adapterId: string;
  readonly signOffStatus: string;

  constructor(row: P3AdapterLicenseRow) {
    super(
      `Refusing adapter "${row.adapterId}" — blockedUntilSignOff=true (signOffStatus=${row.signOffStatus}). See docs/P3_ADAPTER_RFC.md.`,
    );
    this.name = "P3AdapterLicenseBlockedError";
    this.adapterId = row.adapterId;
    this.signOffStatus = row.signOffStatus;
  }
}

export class P3AdapterUnknownError extends Error {
  readonly adapterId: string;

  constructor(adapterId: string) {
    super(
      `Unknown P3 adapter "${adapterId}" — not present in hsi-p3-adapter-license-matrix.`,
    );
    this.name = "P3AdapterUnknownError";
    this.adapterId = adapterId;
  }
}

/** Lookup a matrix row by adapterId (throws if missing). */
export function getP3AdapterLicenseRow(
  adapterId: string,
  rows: P3AdapterLicenseRow[] = buildP3AdapterLicenseRows(),
): P3AdapterLicenseRow {
  const row = rows.find((r) => r.adapterId === adapterId);
  if (!row) {
    throw new P3AdapterUnknownError(adapterId);
  }
  return row;
}

/**
 * License gate before any adapter run / wire / download.
 * Throws when blockedUntilSignOff=true or mayFlipEvidenceGrade would be true.
 */
export function assertP3AdapterRunnable(
  adapterId: string,
  rows: P3AdapterLicenseRow[] = buildP3AdapterLicenseRows(),
): P3AdapterLicenseRow {
  const row = getP3AdapterLicenseRow(adapterId, rows);
  if (row.blockedUntilSignOff) {
    throw new P3AdapterLicenseBlockedError(row);
  }
  if (row.mayFlipEvidenceGrade !== false) {
    throw new Error(
      `Refusing adapter "${adapterId}" — mayFlipEvidenceGrade must be false`,
    );
  }
  if (row.emitsModelProposalOnly !== true) {
    throw new Error(
      `Refusing adapter "${adapterId}" — emitsModelProposalOnly must be true`,
    );
  }
  if (row.vendorsModelWeights !== false) {
    throw new Error(
      `Refusing adapter "${adapterId}" — vendorsModelWeights must be false`,
    );
  }
  if (row.autoApproveIntoKg !== false) {
    throw new Error(
      `Refusing adapter "${adapterId}" — autoApproveIntoKg must be false`,
    );
  }
  if (row.containsPhi === true) {
    throw new Error(`Refusing adapter "${adapterId}" — containsPhi must be false`);
  }
  return row;
}
