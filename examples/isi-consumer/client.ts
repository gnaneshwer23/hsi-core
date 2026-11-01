/**
 * Minimal HSI → ISI artifact loader for local Discovery fixtures.
 * Proves consume-contract load order + honesty invariants inside hsi-core.
 * Copy/adapt into immunecity — do not import this module from immunecity via monorepo hacks.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type {
  DiscoveryIndex,
  GateCChecklist,
  HonestyFlags,
  HsiWiringSpec,
  IsiConsumeContract,
  IsiConsumeContractArtifact,
} from "./types";

const LOAD_PRIORITY_ORDER = [
  "required_core",
  "required_pilot",
  "recommended_secondary",
  "optional_proposal",
  "optional_aksh",
] as const;

export type IsiConsumerPaths = {
  /** Repo root (hsi-core). */
  repoRoot: string;
  /** Default: site/public/discovery */
  discoveryDir: string;
  /** Default: docs/hsi-isi-wiring-spec.json */
  wiringSpecPath: string;
};

export function defaultPaths(repoRoot = process.cwd()): IsiConsumerPaths {
  const root = resolve(repoRoot);
  return {
    repoRoot: root,
    discoveryDir: resolve(
      process.env.HSI_DISCOVERY_DIR
        ? join(root, process.env.HSI_DISCOVERY_DIR)
        : join(root, "site/public/discovery"),
    ),
    wiringSpecPath: join(root, "docs/hsi-isi-wiring-spec.json"),
  };
}

export function loadJsonFile<T>(absPath: string): T {
  if (!existsSync(absPath)) {
    throw new Error(`Missing fixture: ${absPath}`);
  }
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

export function assertHonestyFlags(
  doc: HonestyFlags,
  label: string,
): void {
  if (doc.notCds !== true) {
    throw new Error(`${label}: expected notCds=true`);
  }
  if (doc.autoApproveIntoKg !== false && doc.autoApproveIntoKg !== undefined) {
    throw new Error(`${label}: expected autoApproveIntoKg=false`);
  }
  if (doc.partnerSigned === true) {
    throw new Error(`${label}: partnerSigned must not be true without named partner`);
  }
  if (doc.containsPhi === true) {
    throw new Error(`${label}: containsPhi must not be true`);
  }
}

export class HsiIsiConsumerClient {
  readonly paths: IsiConsumerPaths;

  constructor(paths: IsiConsumerPaths = defaultPaths()) {
    this.paths = paths;
  }

  discoveryPath(fileName: string): string {
    return join(this.paths.discoveryDir, fileName);
  }

  loadWiringSpec(): HsiWiringSpec {
    const spec = loadJsonFile<HsiWiringSpec>(this.paths.wiringSpecPath);
    assertHonestyFlags(spec, "wiring-spec");
    if (spec.schemaVersion !== "hsi-isi-wiring-spec-1") {
      throw new Error(`Unexpected wiring spec schema: ${spec.schemaVersion}`);
    }
    if (spec.gateC.autoApprove !== false) {
      throw new Error("wiring-spec: gateC.autoApprove must be false");
    }
    if (spec.immunecityEditFromThisWorkspace === true) {
      throw new Error("wiring-spec must keep immunecityEditFromThisWorkspace=false");
    }
    return spec;
  }

  loadConsumeContract(): IsiConsumeContract {
    const contract = loadJsonFile<IsiConsumeContract>(
      this.discoveryPath("hsi-isi-consume-contract.json"),
    );
    assertHonestyFlags(contract, "consume-contract");
    if (contract.gateC.statusOnPublish !== "pending") {
      throw new Error("consume-contract: Gate C statusOnPublish must be pending");
    }
    if (contract.gateC.autoApprove !== false) {
      throw new Error("consume-contract: gateC.autoApprove must be false");
    }
    if (contract.gateC.mayFlipHsiGradeFromChecklist !== false) {
      throw new Error("consume-contract: mayFlipHsiGradeFromChecklist must be false");
    }
    for (const a of contract.artifacts) {
      if (a.autoApproveIntoKg !== false) {
        throw new Error(`artifact ${a.manifestKey}: autoApproveIntoKg must be false`);
      }
    }
    return contract;
  }

  loadDiscoveryIndex(): DiscoveryIndex {
    const index = loadJsonFile<DiscoveryIndex>(this.discoveryPath("index.json"));
    assertHonestyFlags(index, "discovery-index");
    return index;
  }

  /** Artifacts sorted by consume-contract load priority (discovery-available only). */
  listLoadableArtifacts(
    contract: IsiConsumeContract,
  ): IsiConsumeContractArtifact[] {
    const byPriority = new Map<string, number>(
      LOAD_PRIORITY_ORDER.map((p, i) => [p, i]),
    );
    return [...contract.artifacts]
      .filter((a) => existsSync(this.discoveryPath(a.fileName)))
      .sort(
        (a, b) =>
          (byPriority.get(a.loadPriority) ?? 99) -
          (byPriority.get(b.loadPriority) ?? 99),
      );
  }

  loadInContractOrder(contract: IsiConsumeContract): {
    loaded: Array<{ fileName: string; loadPriority: string; keys: string[] }>;
    missingFromDiscovery: string[];
  } {
    const missingFromDiscovery = contract.artifacts
      .filter((a) => !existsSync(this.discoveryPath(a.fileName)))
      .map((a) => a.fileName);

    const loaded = this.listLoadableArtifacts(contract).map((a) => {
      const json = loadJsonFile<Record<string, unknown>>(
        this.discoveryPath(a.fileName),
      );
      return {
        fileName: a.fileName,
        loadPriority: a.loadPriority,
        keys: Object.keys(json).slice(0, 12),
      };
    });

    return { loaded, missingFromDiscovery };
  }

  loadGateCChecklist(): GateCChecklist {
    return loadJsonFile<GateCChecklist>(
      this.discoveryPath("gate-c-checklist.json"),
    );
  }

  /** Full demo proof: wiring + contract + core discovery load. */
  proveContract(): {
    wiringSpecVersion: string;
    contractVersion: string;
    loadedCount: number;
    missingFromDiscovery: string[];
    grades: string[];
    gateCPending: true;
    askStaysRa: boolean;
  } {
    const wiring = this.loadWiringSpec();
    const contract = this.loadConsumeContract();
    this.loadDiscoveryIndex();
    const { loaded, missingFromDiscovery } = this.loadInContractOrder(contract);
    this.loadGateCChecklist();

    const askStaysRa =
      contract.vertical?.askStaysRa === true ||
      contract.vertical?.activeScope === "ra-tnf";

    if (!askStaysRa) {
      throw new Error("vertical: ASK must stay RA (activeScope=ra-tnf)");
    }

    return {
      wiringSpecVersion: String(
        (wiring as { specVersion?: string }).specVersion ?? wiring.schemaVersion,
      ),
      contractVersion: String(contract.contractVersion ?? contract.schemaVersion),
      loadedCount: loaded.length,
      missingFromDiscovery,
      grades: [...contract.grades.hsiGrades],
      gateCPending: true,
      askStaysRa: true,
    };
  }
}
