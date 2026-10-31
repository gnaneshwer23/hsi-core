#!/usr/bin/env bun
/**
 * Validate seed edges + translation cards + LOINC link coverage.
 * Usage: bun run validate
 */
import {
  HSI_EXAMPLE_TRANSLATION_CARDS,
  HSI_T2D_IMMUNO_SEED_EDGES,
  summarizeGradeCounts,
  validateHsiEdge,
  validateTranslationCard,
  isCdsSurfacable,
} from "../index";
import { loincCoverageSummary, seedClaimLoincMap } from "../markers";

let failed = 0;

for (const edge of HSI_T2D_IMMUNO_SEED_EDGES) {
  const result = validateHsiEdge(edge);
  if (!result.ok) {
    failed += 1;
    console.error(`FAIL ${edge.id}: ${result.issues.map((i) => i.message).join("; ")}`);
  }
  if (isCdsSurfacable(edge)) {
    failed += 1;
    console.error(`FAIL ${edge.id}: placeholder seed must not be CDS-surfacable`);
  }
}

for (const card of HSI_EXAMPLE_TRANSLATION_CARDS) {
  const result = validateTranslationCard(card);
  if (!result.ok) {
    failed += 1;
    console.error(`FAIL ${card.id}: ${result.issues.map((i) => i.message).join("; ")}`);
  }
}

const counts = summarizeGradeCounts(HSI_T2D_IMMUNO_SEED_EDGES);
const loinc = loincCoverageSummary();
const links = seedClaimLoincMap();

console.log(
  JSON.stringify(
    {
      ok: failed === 0,
      edges: HSI_T2D_IMMUNO_SEED_EDGES.length,
      gradeCounts: counts,
      loinc,
      claimLoincLinks: links.map((l) => ({
        claimId: l.claimId,
        loinc: l.loinc,
        marker: l.marker.name,
      })),
    },
    null,
    2,
  ),
);

if (failed > 0) {
  console.error(`\n${failed} validation error(s)`);
  process.exit(1);
}

console.error(`\nOK — ${HSI_T2D_IMMUNO_SEED_EDGES.length} edges, ${links.length} claim→LOINC links`);
