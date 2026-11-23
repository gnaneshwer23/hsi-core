/**
 * PR-E2E-09 — premium public pages soft-land.
 *
 * Catalogues the Stage 1 public IA (Researchers / Biotech / Validation and
 * sibling marketing paths) without inventing performance metrics, pilots,
 * gold-standard counts, or clinical/scientific approval claims.
 */

export const E2E_09_PREMIUM_PUBLIC_PAGES_SCHEMA =
  "hsi-e2e-09-premium-public-pages-soft-land-1" as const;

export type E2e09SuiteMode = "check" | "fixture";

export type E2e09SurfaceId =
  | "eight_page_ia_catalog"
  | "researchers_audience_route"
  | "biotech_audience_route"
  | "validation_methodology_route"
  | "premium_public_styling"
  | "seo_honesty_copy"
  | "no_fake_metrics_gate";

export type E2e09SurfaceDisposition =
  | "reuse_adapter"
  | "reuse_copy"
  | "reuse_styles"
  | "honesty_gate";

export type E2e09SurfaceRow = {
  surface: E2e09SurfaceId;
  disposition: E2e09SurfaceDisposition;
  fakeMetricsClaimed: false;
  scientificApproval: false;
  clinicalValidationClaimed: false;
  pilotPerformanceClaimed: false;
  pathHints: readonly string[];
  notes: string;
};

export type E2e09PremiumPublicPagesPacket = {
  schemaVersion: typeof E2E_09_PREMIUM_PUBLIC_PAGES_SCHEMA;
  purpose: "pr_e2e_09_premium_public_pages_soft_land";
  backlogId: "PR-E2E-09";
  priority: "P2";
  scientificApproval: false;
  fakeMetricsClaimed: false;
  clinicalValidationClaimed: false;
  pilotPerformanceClaimed: false;
  goldStandardCountsClaimed: false;
  brandDoctrineAccepted: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  implementationPr: "#474";
  brandDoctrinePr: "#465";
  ciSafeModes: readonly E2e09SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e09SurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-09-premium-public-pages.pending.json";
  softLandDocPath: "docs/engineering/E2E_09_PREMIUM_PUBLIC_PAGES_SOFT_LAND.md";
  honesty: {
    noFakeMetrics: true;
    noInventedPilots: true;
    noGoldStandardScoreboard: true;
    validationMeansMethodologyNotCds: true;
    fixtureIsNotBrandAcceptance: true;
  };
};

export type E2e09Assessment = {
  schemaVersion: "hsi-e2e-09-assessment-1";
  suiteMode: E2e09SuiteMode;
  mayClaimFakeMetrics: false;
  mayClaimClinicalValidation: false;
  mayClaimPilotPerformance: false;
  mayClaimScientificApproval: false;
  mayClaimBrandDoctrineAccepted: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  fakeMetricsClaimed: false;
};

export type E2e09PublicHonesty = {
  schemaVersion: "hsi-e2e-09-public-honesty-1";
  mustKeepNoFakeMetrics: true;
  mustSeparateMethodologyFromSyntheticLab: true;
  mustNotClaimGoldCounts: true;
  mustNotClaimLiveCds: true;
  mustKeepCandidateOnlyLanguage: true;
  reasons: string[];
};

const SURFACES: readonly E2e09SurfaceRow[] = [
  {
    surface: "eight_page_ia_catalog",
    disposition: "reuse_adapter",
    fakeMetricsClaimed: false,
    scientificApproval: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    pathHints: ["site/src/lib/primaryNav.ts"],
    notes: "PUBLIC_MARKETING_PATHS lists the Stage 1 indexed IA; soft-land never invents extra marketed claims.",
  },
  {
    surface: "researchers_audience_route",
    disposition: "reuse_copy",
    fakeMetricsClaimed: false,
    scientificApproval: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    pathHints: ["site/src/pages/AudiencePublicPages.tsx", "site/src/App.tsx"],
    notes: "/researchers keeps candidate-only language; model answers are not approved biology.",
  },
  {
    surface: "biotech_audience_route",
    disposition: "reuse_copy",
    fakeMetricsClaimed: false,
    scientificApproval: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    pathHints: ["site/src/pages/AudiencePublicPages.tsx"],
    notes: "/biotech discusses provenance and review without invented performance or pilot KPIs.",
  },
  {
    surface: "validation_methodology_route",
    disposition: "reuse_copy",
    fakeMetricsClaimed: false,
    scientificApproval: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    pathHints: ["site/src/pages/AudiencePublicPages.tsx"],
    notes: "/validation is methodology/governance; distinct from /research/validation synthetic fixtures.",
  },
  {
    surface: "premium_public_styling",
    disposition: "reuse_styles",
    fakeMetricsClaimed: false,
    scientificApproval: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    pathHints: ["site/src/styles/premium-public.css", "docs related to #465"],
    notes: "Premium public tokens from brand Stage 0; soft-land does not claim owner brand acceptance.",
  },
  {
    surface: "seo_honesty_copy",
    disposition: "reuse_adapter",
    fakeMetricsClaimed: false,
    scientificApproval: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    pathHints: ["site/src/lib/seo/siteSeo.ts"],
    notes: "SEO titles/descriptions must keep research-preview and methodology honesty.",
  },
  {
    surface: "no_fake_metrics_gate",
    disposition: "honesty_gate",
    fakeMetricsClaimed: false,
    scientificApproval: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    pathHints: ["site/src/pages/AudiencePublicPages.tsx", "docs/implementation/02-prioritised-backlog.md"],
    notes: "Exit criterion is eight-page IA without fake metrics — soft-land never invents scoreboards.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Keep PUBLIC_MARKETING_PATHS as the only indexed public IA set.",
  "Do not add invented performance metrics, pilot KPIs, or gold-standard counts.",
  "Keep /validation methodology distinct from /research/validation synthetic fixtures.",
  "Do not claim clinical validation, live CDS, or scientific approval from soft-land green.",
  "Owner brand/visual acceptance (#465 / #371 gates) remains outside this catalog.",
];

const REUSE_MODULES: readonly string[] = [
  "site/src/pages/AudiencePublicPages.tsx",
  "site/src/lib/primaryNav.ts",
  "site/src/lib/seo/siteSeo.ts",
  "site/src/styles/premium-public.css",
  "site/src/App.tsx",
  "site/src/components/public/ResearchPublic.tsx",
  "site/src/components/public/PublicNotices.tsx",
];

export function e2e09PremiumPublicPagesPacket(): E2e09PremiumPublicPagesPacket {
  return {
    schemaVersion: E2E_09_PREMIUM_PUBLIC_PAGES_SCHEMA,
    purpose: "pr_e2e_09_premium_public_pages_soft_land",
    backlogId: "PR-E2E-09",
    priority: "P2",
    scientificApproval: false,
    fakeMetricsClaimed: false,
    clinicalValidationClaimed: false,
    pilotPerformanceClaimed: false,
    goldStandardCountsClaimed: false,
    brandDoctrineAccepted: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    implementationPr: "#474",
    brandDoctrinePr: "#465",
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-09-premium-public-pages.pending.json",
    softLandDocPath: "docs/engineering/E2E_09_PREMIUM_PUBLIC_PAGES_SOFT_LAND.md",
    honesty: {
      noFakeMetrics: true,
      noInventedPilots: true,
      noGoldStandardScoreboard: true,
      validationMeansMethodologyNotCds: true,
      fixtureIsNotBrandAcceptance: true,
    },
  };
}

export function e2e09SurfaceById(surface: E2e09SurfaceId): E2e09SurfaceRow {
  switch (surface) {
    case "eight_page_ia_catalog":
    case "researchers_audience_route":
    case "biotech_audience_route":
    case "validation_methodology_route":
    case "premium_public_styling":
    case "seo_honesty_copy":
    case "no_fake_metrics_gate": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing E2E-09 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown E2E-09 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e09Mode(mode: E2e09SuiteMode): E2e09Assessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-09-assessment-1",
        suiteMode: mode,
        mayClaimFakeMetrics: false,
        mayClaimClinicalValidation: false,
        mayClaimPilotPerformance: false,
        mayClaimScientificApproval: false,
        mayClaimBrandDoctrineAccepted: false,
        ciSafe: true,
        reasons: [
          "check mode validates public IA honesty catalog only",
          "soft-land green is not brand acceptance or fake-metric permission",
        ],
        scientificApproval: false,
        fakeMetricsClaimed: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-09-assessment-1",
        suiteMode: mode,
        mayClaimFakeMetrics: false,
        mayClaimClinicalValidation: false,
        mayClaimPilotPerformance: false,
        mayClaimScientificApproval: false,
        mayClaimBrandDoctrineAccepted: false,
        ciSafe: true,
        reasons: [
          "fixture route/copy checks never invent performance metrics",
          "fixture green is not clinical validation or gold-standard counts",
        ],
        scientificApproval: false,
        fakeMetricsClaimed: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown E2E-09 suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Public-page honesty for PR-E2E-09 soft-land. */
export function assessE2e09PublicHonesty(): E2e09PublicHonesty {
  return {
    schemaVersion: "hsi-e2e-09-public-honesty-1",
    mustKeepNoFakeMetrics: true,
    mustSeparateMethodologyFromSyntheticLab: true,
    mustNotClaimGoldCounts: true,
    mustNotClaimLiveCds: true,
    mustKeepCandidateOnlyLanguage: true,
    reasons: [
      "Indexed public pages must not invent performance or pilot metrics",
      "/validation methodology stays separate from /research/validation fixtures",
      "Gold-standard adjudicated counts are not claimed on public pages",
      "No live CDS or clinical advice on marketing routes",
      "Relationships stay candidate / unreviewed until human review",
    ],
  };
}

export function assertE2e09PremiumPublicPagesSoftLand(
  packet: E2e09PremiumPublicPagesPacket,
): {
  surfaceCount: number;
  fakeMetricsClaimed: false;
  clinicalValidationClaimed: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== E2E_09_PREMIUM_PUBLIC_PAGES_SCHEMA) {
    throw new Error("unexpected E2E-09 premium-public-pages schema");
  }
  if (packet.backlogId !== "PR-E2E-09" || packet.priority !== "P2") {
    throw new Error("soft-land must bind PR-E2E-09 at P2");
  }
  if (
    packet.fakeMetricsClaimed !== false ||
    packet.clinicalValidationClaimed !== false ||
    packet.pilotPerformanceClaimed !== false ||
    packet.goldStandardCountsClaimed !== false
  ) {
    throw new Error("soft-land must not claim metrics, clinical validation, pilots, or gold counts");
  }
  if (
    packet.scientificApproval !== false ||
    packet.brandDoctrineAccepted !== false ||
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false
  ) {
    throw new Error("soft-land must not claim scientific approval, brand acceptance, or signed packet");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven E2E-09 surfaces");
  for (const surface of packet.surfaces) {
    if (
      surface.fakeMetricsClaimed !== false ||
      surface.scientificApproval !== false ||
      surface.clinicalValidationClaimed !== false ||
      surface.pilotPerformanceClaimed !== false
    ) {
      throw new Error(`surface ${surface.surface} must keep all claim flags false`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    fakeMetricsClaimed: false,
    clinicalValidationClaimed: false,
    scientificApproval: false,
  };
}
