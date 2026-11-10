/**
 * One research investigation for the existing gut–immune–metabolic–neuroinflammation
 * demonstration. Deterministic composition of already curated seed edges.
 * No new disease pivot, no model call, no patient data, no self-approval.
 */
import { HSI_GUT_SEED_EDGES } from "./seed/gutScfaMucosal";
import { HSI_NI_SEED_EDGES } from "./seed/neuroVagusCholinergic";
import type { HsiEdge } from "./schema";

export const SCIENTIFIC_INVESTIGATION_SCHEMA = "hsi-scientific-investigation-1" as const;
export const PUBMED_FETCH_DATE = "2026-11-10" as const;

export const EVIDENCE_TIERS = [
  "verified_evidence",
  "uncertain_association",
  "computational_inference",
  "unvalidated_hypothesis",
] as const;

export type EvidenceTier = (typeof EVIDENCE_TIERS)[number];

export const EVIDENCE_TIER_LABEL: Record<EvidenceTier, string> = {
  verified_evidence: "Verified evidence",
  uncertain_association: "Uncertain association",
  computational_inference: "Computational inference",
  unvalidated_hypothesis: "Unvalidated hypothesis",
};

const EDGE_IDS = [
  "HSI-E-GUT-003",
  "HSI-E-GUT-004",
  "HSI-E-GUT-005",
  "HSI-E-GUT-006",
  "HSI-E-GUT-007",
  "HSI-E-NI-001",
] as const;

type EdgeId = (typeof EDGE_IDS)[number];

const TISSUE: Record<EdgeId, { tissue: string; system: string }> = {
  "HSI-E-GUT-003": { tissue: "colonic mucosa", system: "mouse" },
  "HSI-E-GUT-004": { tissue: "colon", system: "mouse" },
  "HSI-E-GUT-005": { tissue: "T-cell culture / mucosa", system: "mouse and in vitro" },
  "HSI-E-GUT-006": { tissue: "T-cell models of colitis", system: "mouse" },
  "HSI-E-GUT-007": { tissue: "intestinal epithelium", system: "Caco-2 monolayer" },
  "HSI-E-NI-001": { tissue: "systemic and hepatic", system: "rodent endotoxaemia" },
};

/** PubMed esummary on 2026-11-10. Titles and first authors match the seed citation labels. */
const PUBMED_CHECK: Record<string, { title: string; firstAuthor: string; pmcid: string | null }> = {
  "24226770": {
    title: "Commensal microbe-derived butyrate induces the differentiation of colonic regulatory T cells.",
    firstAuthor: "Furusawa Y",
    pmcid: null,
  },
  "23828891": {
    title: "The microbial metabolites, short-chain fatty acids, regulate colonic Treg cell homeostasis.",
    firstAuthor: "Smith PM",
    pmcid: "PMC3807819",
  },
  "24917457": {
    title: "Short-chain fatty acids induce both effector and regulatory T cells by suppression of histone deacetylases and regulation of the mTOR-S6K pathway.",
    firstAuthor: "Park J",
    pmcid: "PMC4263689",
  },
  "30918945": {
    title: "Microbiota Metabolite Butyrate Differentially Regulates Th1 and Th17 Cells' Differentiation and Function in Induction of Colitis.",
    firstAuthor: "Chen L",
    pmcid: "PMC6701512",
  },
  "19625695": {
    title: "Butyrate enhances the intestinal barrier by facilitating tight junction assembly via activation of AMP-activated protein kinase in Caco-2 cell monolayers.",
    firstAuthor: "Peng L",
    pmcid: "PMC2728689",
  },
  "10839541": {
    title: "Vagus nerve stimulation attenuates the systemic inflammatory response to endotoxin.",
    firstAuthor: "Borovikova LV",
    pmcid: null,
  },
};

export type DatasetCatalogueEntry = {
  id: string;
  name: string;
  custodian: string;
  gatewayUrl: string;
  accessRoute: string;
  licence: string;
  status: "access_not_requested";
  gatewayFetchedOn: typeof PUBMED_FETCH_DATE;
  patientLevelIngested: false;
  note: string;
};

export const DATASET_CATALOGUE: readonly DatasetCatalogueEntry[] = [
  {
    id: "hdruk-700",
    name: "UK Biobank",
    custodian: "UK Biobank",
    gatewayUrl: "https://healthdatagateway.org/en/dataset/700",
    accessRoute: "UK Biobank access application. Not requested.",
    licence: "Governed research access. Not an open download. Licence not cleared for HSI.",
    status: "access_not_requested",
    gatewayFetchedOn: PUBMED_FETCH_DATE,
    patientLevelIngested: false,
    note: "Gateway metadata only. Similar gut–immune or inflammatory patterns could be tested here if access were granted. No participant rows were copied.",
  },
  {
    id: "hdruk-889",
    name: "Our Future Health Linked Health Records Data",
    custodian: "Our Future Health",
    gatewayUrl: "https://healthdatagateway.org/en/dataset/889",
    accessRoute: "https://research.ourfuturehealth.org.uk/apply-to-access-the-data/ — access not requested.",
    licence: "Controlled access via the custodian. Not ingested.",
    status: "access_not_requested",
    gatewayFetchedOn: PUBMED_FETCH_DATE,
    patientLevelIngested: false,
    note: "Linked health-record metadata on the Gateway. Not an HSI cohort and not a finding.",
  },
  {
    id: "hdruk-355",
    name: "Welsh Longitudinal General Practice Dataset (WLGP)",
    custodian: "SAIL Databank",
    gatewayUrl: "https://healthdatagateway.org/en/dataset/355",
    accessRoute: "https://saildatabank.com/data/apply-to-work-with-the-data/ — access not requested.",
    licence: "SAIL trusted-research-environment access. Not ingested.",
    status: "access_not_requested",
    gatewayFetchedOn: PUBMED_FETCH_DATE,
    patientLevelIngested: false,
    note: "Primary-care metadata only. Longitudinal patterns could be tested after a separate access application.",
  },
];

export type InvestigationSource = {
  id: string;
  pmid: string;
  doi: string;
  citationLabel: string;
  pubmedTitle: string;
  firstAuthor: string;
  pubmedFetchedOn: typeof PUBMED_FETCH_DATE;
  seedRecordedAt: string;
  pmcid: string | null;
  licence: string;
  rightsStatus: "clearance_required";
  passageTextImported: false;
  claimIds: string[];
};

export type InvestigationClaim = {
  id: string;
  statement: string;
  tier: EvidenceTier;
  tierLabel: string;
  sourceIds: string[];
  relationshipId: string | null;
  tissue: string;
  system: string;
  limitation: string;
};

export type InvestigationRelationship = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  claimId: string;
  tier: EvidenceTier;
  tierLabel: string;
  causalClaim: false;
};

export type EvidenceComparisonRow = {
  id: string;
  claimId: string;
  tissue: string;
  system: string;
  tier: EvidenceTier;
  tierLabel: string;
  whatWasCompared: string;
};

export type ContradictionItem = {
  id: string;
  claimIds: [string, string];
  summary: string;
  tier: "unvalidated_hypothesis";
  tierLabel: string;
  resolution: "unresolved";
};

export type ResearchGap = {
  id: string;
  text: string;
  whyItMatters: string;
  tier: EvidenceTier;
  tierLabel: string;
};

export type TestableHypothesis = {
  id: string;
  statement: string;
  tier: "unvalidated_hypothesis";
  tierLabel: string;
  sourceIds: string[];
  suggestedObservation: string;
  experimentSpecified: false;
};

export type ReviewState =
  | {
      status: "not_independently_reviewed";
      aiMayApprove: false;
      scientificTruthEstablished: false;
      reviewerLabel: null;
      comment: null;
      recordedAt: null;
    }
  | {
      status: "comments_recorded";
      aiMayApprove: false;
      scientificTruthEstablished: false;
      reviewerLabel: "Example reviewer";
      comment: string;
      recordedAt: string;
    };

export type ScientificInvestigation = {
  schemaVersion: typeof SCIENTIFIC_INVESTIGATION_SCHEMA;
  id: string;
  demonstrationId: "demo_gut_neuroinflammation_001";
  questionId: "gut-neuro" | "metabolic";
  question: string;
  mode: "demo_fixture";
  liveBackend: false;
  patientDataConnected: false;
  draftedBy: "deterministic_composer";
  evidence: InvestigationClaim[];
  relationships: InvestigationRelationship[];
  comparison: EvidenceComparisonRow[];
  contradictions: ContradictionItem[];
  gaps: ResearchGap[];
  hypotheses: TestableHypothesis[];
  sources: InvestigationSource[];
  datasets: readonly DatasetCatalogueEntry[];
  tierCounts: Record<EvidenceTier, number>;
  verifiedEvidenceNote: string;
  review: ReviewState;
  report: { markdown: string };
  disclaimer: string;
};

export const EXAMPLE_QUESTIONS = [
  {
    id: "gut-neuro" as const,
    text: "How might gut microbial metabolites influence neuroinflammation?",
    runnable: true,
  },
  {
    id: "metabolic" as const,
    text: "How might metabolic inflammation relate to insulin resistance?",
    runnable: true,
  },
] as const;

const GUT_QUESTION = EXAMPLE_QUESTIONS[0].text;
const METABOLIC_QUESTION = EXAMPLE_QUESTIONS[1].text;

function tierForEdge(edge: HsiEdge): EvidenceTier {
  if (edge.teachingStatus === "hypothesized") return "unvalidated_hypothesis";
  return "uncertain_association";
}

function bibliographicKey(value: string): string {
  return value.toLowerCase().replace(/['’]/g, "'").replace(/\.$/, "").replace(/\s+/g, " ").trim();
}

function requireEdge(id: EdgeId): HsiEdge {
  const edge = [...HSI_GUT_SEED_EDGES, ...HSI_NI_SEED_EDGES].find((item) => item.id === id);
  if (!edge || !edge.provenance.pmid || !edge.provenance.doi || !edge.provenance.citationLabel) {
    throw new Error(`Investigation seed edge ${id} is missing a verified locator`);
  }
  const check = PUBMED_CHECK[edge.provenance.pmid];
  if (!check) throw new Error(`No PubMed check for ${edge.provenance.pmid}`);
  const citation = bibliographicKey(edge.provenance.citationLabel);
  if (!citation.includes(bibliographicKey(check.title))) {
    throw new Error(`Seed citation for PMID ${edge.provenance.pmid} does not contain the PubMed title`);
  }
  const surname = bibliographicKey(check.firstAuthor).split(" ")[0] ?? "";
  if (!citation.startsWith(surname)) {
    throw new Error(`Seed citation for PMID ${edge.provenance.pmid} does not start with the PubMed first author`);
  }
  return edge;
}

function sourceIdFor(pmid: string): string {
  return `src-pmid-${pmid}`;
}

function licenceFor(pmcid: string | null): string {
  if (pmcid) {
    return `PubMed record plus PMC ${pmcid}. Open-access hosting is not a reuse clearance. Passage text is not stored.`;
  }
  return "PubMed bibliographic record only. Publisher full text is not licensed for storage in this repository.";
}

function buildSources(edges: HsiEdge[], extraClaimIds: Map<string, string[]>): InvestigationSource[] {
  const byPmid = new Map<string, InvestigationSource>();
  for (const edge of edges) {
    const pmid = edge.provenance.pmid!;
    const check = PUBMED_CHECK[pmid]!;
    const existing = byPmid.get(pmid);
    const claimIds = [edge.claimId, ...(extraClaimIds.get(pmid) ?? [])];
    if (existing) {
      existing.claimIds = [...new Set([...existing.claimIds, ...claimIds])];
      continue;
    }
    byPmid.set(pmid, {
      id: sourceIdFor(pmid),
      pmid,
      doi: edge.provenance.doi!,
      citationLabel: edge.provenance.citationLabel!,
      pubmedTitle: check.title,
      firstAuthor: check.firstAuthor,
      pubmedFetchedOn: PUBMED_FETCH_DATE,
      seedRecordedAt: edge.provenance.recordedAt,
      pmcid: check.pmcid,
      licence: licenceFor(check.pmcid),
      rightsStatus: "clearance_required",
      passageTextImported: false,
      claimIds: [...new Set(claimIds)],
    });
  }
  return [...byPmid.values()];
}

function claimFromEdge(edge: HsiEdge): InvestigationClaim {
  const id = edge.id as EdgeId;
  const place = TISSUE[id];
  const tier = tierForEdge(edge);
  return {
    id: edge.claimId,
    statement: edgeAssertion(edge),
    tier,
    tierLabel: EVIDENCE_TIER_LABEL[tier],
    sourceIds: [sourceIdFor(edge.provenance.pmid!)],
    relationshipId: edge.id,
    tissue: place.tissue,
    system: place.system,
    limitation:
      tier === "unvalidated_hypothesis"
        ? "Competing frame kept separate. Source linkage is not scientific verification and is not causation."
        : "Associative or context-limited finding. Source linkage is not independent scientific verification and is not causation.",
  };
}

function edgeAssertion(edge: HsiEdge): string {
  if (edge.id === "HSI-E-GUT-003") {
    return "Commensal microbe-derived butyrate induces differentiation of colonic regulatory T cells in the mouse Nature 2013 study. This is an uncertain association, not a human disease mechanism.";
  }
  if (edge.id === "HSI-E-GUT-004") {
    return "Microbiota-derived short-chain fatty acids regulate the colonic Treg pool in an Ffar2-dependent manner in mice. Uncertain association.";
  }
  if (edge.id === "HSI-E-GUT-005") {
    return "Short-chain fatty acids can promote IL-17-producing T cells depending on cytokine milieu. Unvalidated competing frame, not settled causation.";
  }
  if (edge.id === "HSI-E-GUT-006") {
    return "Butyrate can inhibit Th17 differentiation in T-cell models of colitis. Unvalidated competing frame, kept separate from the promotion frame.";
  }
  if (edge.id === "HSI-E-GUT-007") {
    return "Butyrate facilitated tight-junction assembly in Caco-2 monolayers. Uncertain association from an in vitro barrier model.";
  }
  if (edge.id === "HSI-E-NI-001") {
    return "Vagus nerve stimulation attenuated the systemic inflammatory response to endotoxin, including TNF, in a rodent model. Uncertain association, not a treatment claim.";
  }
  return edge.provenance.citationLabel ?? edge.id;
}

function countTiers(claims: readonly InvestigationClaim[]): Record<EvidenceTier, number> {
  const counts: Record<EvidenceTier, number> = {
    verified_evidence: 0,
    uncertain_association: 0,
    computational_inference: 0,
    unvalidated_hypothesis: 0,
  };
  for (const claim of claims) counts[claim.tier] += 1;
  return counts;
}

export function buildScientificInvestigation(questionId: "gut-neuro" | "metabolic" = "gut-neuro"): ScientificInvestigation {
  const edges = EDGE_IDS.map(requireEdge);
  const baseClaims = edges.map(claimFromEdge);
  const walkSourcePmids = ["24226770", "23828891", "19625695", "10839541"];
  const inference: InvestigationClaim = {
    id: "HSI-C-WALK-001",
    statement:
      "A graph walk can be drawn from butyrate–Treg and epithelial-barrier edges to vagal control of TNF, and from there toward a neuroinflammation context. The walk is a computational composition of separate neighbourhoods. It is not a measured causal path.",
    tier: "computational_inference",
    tierLabel: EVIDENCE_TIER_LABEL.computational_inference,
    sourceIds: walkSourcePmids.map(sourceIdFor),
    relationshipId: "HSI-E-WALK-001",
    tissue: "cross-tissue composition",
    system: "not a single experimental system",
    limitation: "Composed by a deterministic join of curated edges. No model score and no new measurement.",
  };
  const hypothesisClaim: InvestigationClaim = {
    id: "HSI-C-HYP-001",
    statement:
      "Gut microbial butyrate might alter neuroinflammation by changing peripheral immune tone. This is an unvalidated hypothesis. It is not a disease mechanism and not a treatment claim.",
    tier: "unvalidated_hypothesis",
    tierLabel: EVIDENCE_TIER_LABEL.unvalidated_hypothesis,
    sourceIds: walkSourcePmids.map(sourceIdFor),
    relationshipId: null,
    tissue: "not established",
    system: "not established",
    limitation: "No experiment in this record tests the cross-domain step.",
  };
  const evidence = [...baseClaims, inference, hypothesisClaim];
  const extra = new Map<string, string[]>(walkSourcePmids.map((pmid) => [pmid, ["HSI-C-WALK-001", "HSI-C-HYP-001"]]));
  const sources = buildSources(edges, extra);
  const relationships: InvestigationRelationship[] = [
    ...edges.map((edge) => {
      const tier = tierForEdge(edge);
      return {
        id: edge.id,
        subject: edge.subjectLabel,
        predicate: edge.edgeType,
        object: edge.objectLabel,
        claimId: edge.claimId,
        tier,
        tierLabel: EVIDENCE_TIER_LABEL[tier],
        causalClaim: false as const,
      };
    }),
    {
      id: "HSI-E-WALK-001",
      subject: "Butyrate / SCFA neighbourhood",
      predicate: "composed_with",
      object: "Vagal TNF neighbourhood",
      claimId: "HSI-C-WALK-001",
      tier: "computational_inference",
      tierLabel: EVIDENCE_TIER_LABEL.computational_inference,
      causalClaim: false as const,
    },
  ];
  const comparison: EvidenceComparisonRow[] = evidence
    .filter((claim) => claim.relationshipId !== "HSI-E-WALK-001")
    .map((claim) => ({
      id: `cmp-${claim.id}`,
      claimId: claim.id,
      tissue: claim.tissue,
      system: claim.system,
      tier: claim.tier,
      tierLabel: claim.tierLabel,
      whatWasCompared: `${claim.tissue} · ${claim.system}`,
    }));
  const contradictions: ContradictionItem[] = [
    {
      id: "contra-th17-direction",
      claimIds: ["HSI-C-GUT-005", "HSI-C-GUT-006"],
      summary:
        "One curated frame says short-chain fatty acids can promote Th17 cells. Another says butyrate can inhibit Th17 differentiation. Both stay unvalidated. The conflict is unresolved.",
      tier: "unvalidated_hypothesis",
      tierLabel: EVIDENCE_TIER_LABEL.unvalidated_hypothesis,
      resolution: "unresolved",
    },
  ];
  const gaps: ResearchGap[] = [
    {
      id: "gap-no-verified",
      text: "No item in this investigation is verified evidence. Bibliographic checks do not verify the biology.",
      whyItMatters: "A reader can otherwise treat a PMID as proof.",
      tier: "verified_evidence",
      tierLabel: EVIDENCE_TIER_LABEL.verified_evidence,
    },
    {
      id: "gap-cross-tissue",
      text: "No study in this set measures gut metabolite exposure and a neuroinflammation readout in the same experiment.",
      whyItMatters: "The cross-domain question is exactly the missing measurement.",
      tier: "uncertain_association",
      tierLabel: EVIDENCE_TIER_LABEL.uncertain_association,
    },
    {
      id: "gap-rights",
      text: "Passage text is not stored. PubMed and PMC records still need source-rights clearance before quotations are kept.",
      whyItMatters: "Traceability currently reaches the citation, not the supporting sentence.",
      tier: "uncertain_association",
      tierLabel: EVIDENCE_TIER_LABEL.uncertain_association,
    },
    {
      id: "gap-metabolic-seed",
      text: "Immuno-metabolic seed rows that cite a paper about a different disease object were not copied into this evidence list.",
      whyItMatters: "An insulin-resistance answer cannot be assembled from a mismatched locator.",
      tier: "computational_inference",
      tierLabel: EVIDENCE_TIER_LABEL.computational_inference,
    },
    {
      id: "gap-cohort",
      text: "No governed population dataset has been requested. UK Biobank, Our Future Health linked records, and the Welsh Longitudinal General Practice dataset are catalogue entries only.",
      whyItMatters: "A human pattern cannot be claimed from mouse and cell studies plus an unused catalogue.",
      tier: "unvalidated_hypothesis",
      tierLabel: EVIDENCE_TIER_LABEL.unvalidated_hypothesis,
    },
  ];
  const hypotheses: TestableHypothesis[] = [
    {
      id: "hyp-butyrate-neuro",
      statement: hypothesisClaim.statement,
      tier: "unvalidated_hypothesis",
      tierLabel: EVIDENCE_TIER_LABEL.unvalidated_hypothesis,
      sourceIds: hypothesisClaim.sourceIds,
      suggestedObservation:
        "In one pre-registered comparison, record butyrate exposure, a Treg readout, a Th17 readout, and a separate neuroinflammation marker, each with tissue, species or system, assay and timepoint. Define controls first. This is a research suggestion, not a protocol and not a clinical instruction.",
      experimentSpecified: false,
    },
  ];
  const question = questionId === "metabolic" ? METABOLIC_QUESTION : GUT_QUESTION;
  const review: ReviewState = {
    status: "not_independently_reviewed",
    aiMayApprove: false,
    scientificTruthEstablished: false,
    reviewerLabel: null,
    comment: null,
    recordedAt: null,
  };
  const record: ScientificInvestigation = {
    schemaVersion: SCIENTIFIC_INVESTIGATION_SCHEMA,
    id: questionId === "metabolic" ? "inv-metabolic-inflammation-001" : "inv-gut-neuro-001",
    demonstrationId: "demo_gut_neuroinflammation_001",
    questionId,
    question,
    mode: "demo_fixture",
    liveBackend: false,
    patientDataConnected: false,
    draftedBy: "deterministic_composer",
    evidence,
    relationships,
    comparison,
    contradictions,
    gaps,
    hypotheses,
    sources,
    datasets: DATASET_CATALOGUE,
    tierCounts: countTiers(evidence),
    verifiedEvidenceNote:
      "Verified evidence: none. A checked citation is not verified biology, and this composer cannot mark its own output as verified.",
    review,
    report: { markdown: "" },
    disclaimer:
      "Research demonstration. Curated example evidence. Not a diagnosis, not a treatment, not clinical validation, and not a statement that the biology is established.",
  };
  record.report = { markdown: renderInvestigationMarkdown(record) };
  return record;
}

export type ReviewActor =
  | { kind: "human_scientific_reviewer"; label: "Example reviewer" }
  | { kind: "agent"; label: string }
  | { kind: "drafter"; label: string };

export function recordIndependentReview(
  record: ScientificInvestigation,
  actor: ReviewActor,
  comment: string,
  recordedAt: string,
): ScientificInvestigation {
  if (actor.kind !== "human_scientific_reviewer") {
    throw new Error("AI output cannot approve or review itself");
  }
  const text = comment.trim();
  if (text.length < 20 || text.length > 2000) {
    throw new Error("Review comment must be 20–2000 characters");
  }
  if (!Number.isFinite(Date.parse(recordedAt))) throw new Error("Review time is not a valid date");
  const next: ScientificInvestigation = {
    ...record,
    review: {
      status: "comments_recorded",
      aiMayApprove: false,
      scientificTruthEstablished: false,
      reviewerLabel: "Example reviewer",
      comment: text,
      recordedAt,
    },
  };
  next.report = { markdown: renderInvestigationMarkdown(next) };
  return next;
}

export type WorkspaceAuthorization = {
  signedIn: boolean;
  writesEnabled: boolean;
  role: "anonymous" | "researcher" | "research_admin" | "agent" | "scientific_reviewer";
};

export type SaveResult =
  | { ok: true; id: string; where: "authorised_workspace" }
  | { ok: false; code: "SIGN_IN_REQUIRED" | "RESEARCH_WRITES_DISABLED" | "ROLE_NOT_PERMITTED" };

export function authoriseWorkspaceSave(auth: WorkspaceAuthorization): SaveResult | { ok: true } {
  if (!auth.signedIn || auth.role === "anonymous" || auth.role === "agent") {
    return { ok: false, code: "SIGN_IN_REQUIRED" };
  }
  if (auth.role !== "researcher" && auth.role !== "research_admin") {
    return { ok: false, code: "ROLE_NOT_PERMITTED" };
  }
  if (!auth.writesEnabled) return { ok: false, code: "RESEARCH_WRITES_DISABLED" };
  return { ok: true };
}

export class InvestigationMemory {
  private readonly rows = new Map<string, ScientificInvestigation>();

  saveWorkspace(record: ScientificInvestigation, auth: WorkspaceAuthorization): SaveResult {
    const gate = authoriseWorkspaceSave(auth);
    if (!gate.ok) return gate;
    this.rows.set(record.id, record);
    return { ok: true, id: record.id, where: "authorised_workspace" };
  }

  saveBrowserSession(record: ScientificInvestigation): { ok: true; where: "browser_session_only"; id: string } {
    this.rows.set(`session:${record.id}`, record);
    return { ok: true, where: "browser_session_only", id: record.id };
  }

  reopen(id: string, where: "authorised_workspace" | "browser_session_only"): ScientificInvestigation | null {
    const key = where === "browser_session_only" ? `session:${id}` : id;
    return this.rows.get(key) ?? null;
  }
}

export function renderInvestigationMarkdown(record: ScientificInvestigation): string {
  const lines = [
    "# Research investigation",
    "",
    record.question,
    "",
    `Record: ${record.id}`,
    `Demonstration: ${record.demonstrationId}`,
    "Mode: demo fixture. Live backend: no. Patient data: no.",
    "",
    "## Evidence tiers",
    "",
    record.verifiedEvidenceNote,
    ...EVIDENCE_TIERS.map((tier) => `- ${EVIDENCE_TIER_LABEL[tier]}: ${record.tierCounts[tier]}`),
    "",
    "## Evidence",
    "",
  ];
  for (const claim of record.evidence) {
    lines.push(`### ${claim.id}`, "", `Tier: ${claim.tierLabel}`, claim.statement, `Context: ${claim.tissue}; ${claim.system}`, claim.limitation, `Sources: ${claim.sourceIds.join(", ")}`, "");
  }
  lines.push("## Relationships", "");
  for (const edge of record.relationships) {
    lines.push(`- ${edge.subject} → ${edge.predicate} → ${edge.object} (${edge.tierLabel}; not a causal claim)`);
  }
  lines.push("", "## Comparison", "");
  for (const row of record.comparison) lines.push(`- ${row.claimId}: ${row.whatWasCompared} (${row.tierLabel})`);
  lines.push("", "## Contradictions", "");
  for (const item of record.contradictions) lines.push(`- ${item.summary} Resolution: ${item.resolution}.`);
  lines.push("", "## Research gaps", "");
  for (const gap of record.gaps) lines.push(`- ${gap.text} ${gap.whyItMatters}`);
  lines.push("", "## Hypotheses", "");
  for (const item of record.hypotheses) {
    lines.push(`- ${item.tierLabel}: ${item.statement}`, `  Suggestion: ${item.suggestedObservation}`, "  Experiment specified: no.");
  }
  lines.push("", "## Human review", "", `Status: ${record.review.status}. Scientific truth established: no. AI may approve: no.`);
  if (record.review.status === "comments_recorded") {
    lines.push(`Example reviewer comment: ${record.review.comment}`);
  }
  lines.push("", "## Sources", "");
  for (const source of record.sources) {
    lines.push(`- PMID ${source.pmid}. ${source.pubmedTitle} ${source.firstAuthor}. DOI ${source.doi}. Fetched ${source.pubmedFetchedOn}. Claims: ${source.claimIds.join(", ")}. ${source.licence}`);
  }
  lines.push("", "## Datasets that could be requested", "");
  for (const dataset of record.datasets) {
    lines.push(`- ${dataset.name} (${dataset.custodian}). Status: access not requested. ${dataset.gatewayUrl}`);
  }
  lines.push("", record.disclaimer, "");
  return lines.join("\n");
}

export function renderInvestigationJson(record: ScientificInvestigation): string {
  return JSON.stringify(record, null, 2) + "\n";
}

export function claimsForSource(record: ScientificInvestigation, sourceId: string): InvestigationClaim[] {
  const source = record.sources.find((item) => item.id === sourceId);
  if (!source) return [];
  return record.evidence.filter((claim) => source.claimIds.includes(claim.id));
}

export function sourcesForClaim(record: ScientificInvestigation, claimId: string): InvestigationSource[] {
  const claim = record.evidence.find((item) => item.id === claimId);
  if (!claim) return [];
  return record.sources.filter((source) => claim.sourceIds.includes(source.id));
}
