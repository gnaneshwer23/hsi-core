/**
 * Offline fixture responses for Europe PMC, Open Targets and UniProt.
 * The demonstration never calls the network at runtime. Records are bibliographic
 * metadata (verified against PubMed / Open Targets on the dates below), not
 * licensed full text, and they are not scientific approval.
 *
 * Honesty: do not invent PMIDs or fabricate association scores. If a live refresh
 * fails, fail closed with a clear label instead of substituting made-up values.
 */
import type { FetchLike } from "../fetchLike";
import { searchEuropePmcByQuery } from "../evidence/europePmcBibliographicLookup";
import { lookupOpenTargetsDiseaseAssociations } from "../evidence/openTargetsLookup";
import { lookupUniprotMetadataByAccession } from "../evidence/uniprotMetadataLookup";

/** PubMed verification date for the two literature records below (esummary check). */
export const DEMO_LITERATURE_VERIFIED_AT = "2026-11-09";

/**
 * Open Targets association scores captured live from GraphQL v4 for
 * MONDO_0008383 (rheumatoid arthritis). Score ≠ causation / efficacy / approval.
 */
export const DEMO_OPEN_TARGETS_FETCHED_AT = "2026-11-09";
export const DEMO_OPEN_TARGETS_DISEASE_ID = "MONDO_0008383";

const EUROPE_PMC = {
  hitCount: 2,
  resultList: {
    result: [
      {
        id: "27912057",
        source: "MED",
        pmid: "27912057",
        doi: "10.1016/j.cell.2016.11.018",
        title:
          "Gut Microbiota Regulate Motor Deficits and Neuroinflammation in a Model of Parkinson's Disease.",
        authorString: "Sampson TR, Debelius JW, Thron T, et al.",
        journalTitle: "Cell",
        pubYear: "2016",
        isRetracted: "N",
      },
      {
        id: "11298065",
        source: "MED",
        pmid: "11298065",
        doi: "10.1046/j.1365-2125.2001.00321.x",
        title: "Anti-TNF agents for rheumatoid arthritis.",
        authorString: "Seymour HE, Worsley A, Smith JM, Thomas SH.",
        journalTitle: "Br J Clin Pharmacol",
        pubYear: "2001",
        isRetracted: "N",
      },
    ],
  },
};

/** Live-captured 2026-11-09; TNF/IL6/FFAR2 Ensembl IDs checked against OT target search. */
const OPEN_TARGETS = {
  data: {
    disease: {
      id: DEMO_OPEN_TARGETS_DISEASE_ID,
      name: "rheumatoid arthritis",
      associatedTargets: {
        count: 7261,
        rows: [
          {
            score: 0.6368370219733271,
            target: { id: "ENSG00000232810", approvedSymbol: "TNF" },
            datatypeScores: [],
            datasourceScores: [],
          },
          {
            score: 0.5150541564338188,
            target: { id: "ENSG00000136244", approvedSymbol: "IL6" },
            datatypeScores: [],
            datasourceScores: [],
          },
          {
            score: 0.0229406492832586,
            target: { id: "ENSG00000126262", approvedSymbol: "FFAR2" },
            datatypeScores: [],
            datasourceScores: [],
          },
        ],
      },
    },
  },
};

const UNIPROT_TNF = {
  primaryAccession: "P01375",
  entryType: "UniProtKB reviewed (Swiss-Prot)",
  proteinDescription: { recommendedName: { fullName: { value: "Tumor necrosis factor" } } },
  genes: [{ geneName: { value: "TNF" } }],
  organism: { scientificName: "Homo sapiens" },
};

export const offlineEvidenceFetcher: FetchLike = (input) => {
  const url = String(input);
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();
  let body: unknown = EUROPE_PMC;
  if (host.includes("opentargets")) body = OPEN_TARGETS;
  else if (host.includes("uniprot")) body = UNIPROT_TNF;
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
};

export type DemoEvidenceTarget = {
  symbol: string;
  ensemblId: string;
  score: number;
  scoreFetchedAt: string;
  scoreIsNotCausation: true;
};

export type DemoEvidenceResult =
  | {
      mode: "fixture";
      networkUsed: false;
      literatureVerifiedAt: string;
      literature: Array<{
        pmid: string | null;
        doi: string | null;
        title: string;
        year: number | null;
      }>;
      targets: DemoEvidenceTarget[];
      openTargets: {
        diseaseId: string;
        ok: true;
        fetchedAt: string;
      };
      protein: {
        accession: string;
        name: string | null;
        genes: readonly string[];
      };
    }
  | {
      mode: "fixture";
      networkUsed: false;
      literatureVerifiedAt: string;
      literature: Array<{
        pmid: string | null;
        doi: string | null;
        title: string;
        year: number | null;
      }>;
      targets: [];
      openTargets: {
        diseaseId: string;
        ok: false;
        fetchedAt: null;
        label: string;
      };
      protein: {
        accession: string;
        name: string | null;
        genes: readonly string[];
      };
    };

export async function retrieveFixtureEvidence(now = "2026-11-09T12:00:00.000Z"): Promise<DemoEvidenceResult> {
  const literature = await searchEuropePmcByQuery({
    query: "butyrate neuroinflammation rheumatoid arthritis",
    pageSize: 2,
    fetcher: offlineEvidenceFetcher,
    now: () => new Date(now),
  });
  const targets = await lookupOpenTargetsDiseaseAssociations({
    diseaseId: DEMO_OPEN_TARGETS_DISEASE_ID,
    pageSize: 10,
    enableIndirect: false,
    fetcher: offlineEvidenceFetcher,
    now: () => new Date(now),
  });
  const protein = await lookupUniprotMetadataByAccession({
    accession: "P01375",
    fetcher: offlineEvidenceFetcher,
    lookupMode: "fixture",
    now: () => new Date(now),
  });
  if (!literature.ok) throw new Error(`Europe PMC fixture failed: ${literature.detail}`);
  if (!protein.ok) throw new Error(`UniProt fixture failed: ${protein.detail}`);

  const literatureRows = literature.records.map((record) => ({
    pmid: record.pmid,
    doi: record.doi,
    title: record.title,
    year: record.publicationYear,
  }));
  const proteinRow = {
    accession: protein.record.accession,
    name: protein.record.proteinName,
    genes: [...protein.record.geneNames],
  };

  if (!targets.ok) {
    return {
      mode: "fixture",
      networkUsed: false,
      literatureVerifiedAt: DEMO_LITERATURE_VERIFIED_AT,
      literature: literatureRows,
      targets: [],
      openTargets: {
        diseaseId: DEMO_OPEN_TARGETS_DISEASE_ID,
        ok: false,
        fetchedAt: null,
        label: `Open Targets scores unavailable — ${targets.detail} (fail-closed; not fabricated)`,
      },
      protein: proteinRow,
    };
  }

  return {
    mode: "fixture",
    networkUsed: false,
    literatureVerifiedAt: DEMO_LITERATURE_VERIFIED_AT,
    literature: literatureRows,
    targets: targets.record.associations.map((row) => ({
      symbol: row.approvedSymbol,
      ensemblId: row.targetEnsemblId,
      score: row.score,
      scoreFetchedAt: DEMO_OPEN_TARGETS_FETCHED_AT,
      scoreIsNotCausation: true,
    })),
    openTargets: {
      diseaseId: DEMO_OPEN_TARGETS_DISEASE_ID,
      ok: true,
      fetchedAt: DEMO_OPEN_TARGETS_FETCHED_AT,
    },
    protein: proteinRow,
  };
}
