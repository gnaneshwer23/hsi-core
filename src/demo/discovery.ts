/**
 * Target prioritisation and repurposing hypotheses.
 * Model adapters stay proposal-only. Nothing here is a validated target or a prescription.
 */
export type DiscoveryTarget = {
  symbol: string;
  ensemblId: string;
  openTargetsScore: number;
  scoreFetchedAt: string;
  rank: number;
  scoreIsNotCausation: true;
};

export type RepurposingHypothesis = {
  id: string;
  text: string;
  label: "unvalidated_hypothesis";
  adapters: readonly { name: "RDKit" | "ESM"; status: "proposal_only" }[];
};

export function prioritiseTargets(
  rows: readonly { symbol: string; ensemblId: string; score: number; scoreFetchedAt: string }[],
): DiscoveryTarget[] {
  return [...rows]
    .sort((a, b) => b.score - a.score || a.symbol.localeCompare(b.symbol))
    .map((row, index) => ({
      symbol: row.symbol,
      ensemblId: row.ensemblId,
      openTargetsScore: row.score,
      scoreFetchedAt: row.scoreFetchedAt,
      rank: index + 1,
      scoreIsNotCausation: true,
    }));
}

export function repurposingHypotheses(): RepurposingHypothesis[] {
  return [
    {
      id: "hyp-ffar2-context",
      text: "FFAR2 appears in the Open Targets rheumatoid arthritis association list at a low score. A repurposing hypothesis that a butyrate-receptor ligand would alter neuroinflammation is unvalidated and is not a development candidate.",
      label: "unvalidated_hypothesis",
      adapters: [
        { name: "RDKit", status: "proposal_only" },
        { name: "ESM", status: "proposal_only" },
      ],
    },
  ];
}
