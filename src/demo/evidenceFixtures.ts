/**
 * Offline fixture responses for Europe PMC, Open Targets and UniProt.
 * The demonstration never calls the network. Records are bibliographic metadata,
 * not licensed full text, and they are not scientific approval.
 */
import type { FetchLike } from "../fetchLike";
import { searchEuropePmcByQuery } from "../evidence/europePmcBibliographicLookup";
import { lookupOpenTargetsDiseaseAssociations } from "../evidence/openTargetsLookup";
import { lookupUniprotMetadataByAccession } from "../evidence/uniprotMetadataLookup";

const EUROPE_PMC = {
  hitCount: 2,
  resultList: {
    result: [
      {
        id: "31180194",
        source: "MED",
        pmid: "31180194",
        doi: "10.1038/s41586-019-1237-9",
        title: "Gut microbial metabolites and host inflammatory tone",
        authorString: "Fixture Author A",
        journalTitle: "Nature",
        pubYear: "2019",
        isRetracted: "N",
      },
      {
        id: "33479220",
        source: "MED",
        pmid: "33479220",
        doi: "10.1136/annrheumdis-2020-219000",
        title: "TNF blockade and systemic inflammation in rheumatoid arthritis",
        authorString: "Fixture Author B",
        journalTitle: "Annals of the Rheumatic Diseases",
        pubYear: "2021",
        isRetracted: "N",
      },
    ],
  },
};

const OPEN_TARGETS = {
  data: {
    disease: {
      id: "EFO_0000685",
      name: "rheumatoid arthritis",
      associatedTargets: {
        count: 3,
        rows: [
          { score: 0.82, target: { id: "ENSG00000174600", approvedSymbol: "TNF" }, datatypeScores: [], datasourceScores: [] },
          { score: 0.61, target: { id: "ENSG00000136244", approvedSymbol: "IL6" }, datatypeScores: [], datasourceScores: [] },
          { score: 0.22, target: { id: "ENSG00000126266", approvedSymbol: "FFAR2" }, datatypeScores: [], datasourceScores: [] },
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
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } }));
};

export async function retrieveFixtureEvidence(now = "2026-11-09T12:00:00.000Z") {
  const literature = await searchEuropePmcByQuery({
    query: "butyrate neuroinflammation rheumatoid arthritis",
    pageSize: 2,
    fetcher: offlineEvidenceFetcher,
    now: () => new Date(now),
  });
  const targets = await lookupOpenTargetsDiseaseAssociations({
    diseaseId: "EFO_0000685",
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
  if (!targets.ok) throw new Error(`Open Targets fixture failed: ${targets.detail}`);
  if (!protein.ok) throw new Error(`UniProt fixture failed: ${protein.detail}`);
  return {
    mode: "fixture" as const,
    networkUsed: false,
    literature: literature.records.map((record) => ({
      pmid: record.pmid,
      doi: record.doi,
      title: record.title,
      year: record.publicationYear,
    })),
    targets: targets.record.associations.map((row) => ({
      symbol: row.approvedSymbol,
      ensemblId: row.targetEnsemblId,
      score: row.score,
      scoreIsNotCausation: true,
    })),
    protein: {
      accession: protein.record.accession,
      name: protein.record.proteinName,
      genes: protein.record.geneNames,
    },
  };
}
