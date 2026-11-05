# P1 Scientific Discovery Intelligence — parallel development plan

## Current implementation
- Deterministic candidate screening: `site/src/features/science/discoveryInvestigation.ts`.
- Integrated display: `site/src/pages/ScientificResearchWorkbench.tsx`.
- Regression tests: `test/discoveryInvestigation.test.ts`.
- SSc Tfh/IL-21/B-cell source scope remains unchanged.
- No independent scientific validation or autonomous claim publication.

## P1 staged build
1. **P1.1 Evidence discovery and contextual tensions** — existing SSc verification records, source provenance, missing locators, opposing predicates, methodological disagreements. Initial code committed.
2. **P1.2 Mechanism investigation** — reuse ISI mechanism reasoning through a versioned adapter. Separate observed human evidence, ex vivo, animal interventions and inferred mechanisms.
3. **P1.3 Evidence gap and contradiction workbench** — context-normalised comparisons, explicit uncertainty and falsification checks. Never infer biological contradiction from differing denominators.
4. **P1.4 Hypothesis candidates** — source-linked, falsifiable, alternative explanations, predicted observations and reviewer-gated status. No automatic graph writes.
5. **P1.5 Reproducible research dossier** — versioned inputs, methods, release hash, source locators, analysis outputs and export.
6. **P1.6 Authorised research integration** — connect P0.4.2 authenticated intake, reviewer decision history and graph releases after independent staging verification.

## Parallel P0.4.2 infrastructure
- Complete immutable publisher pin and independent source-of-trust.
- Apply HSI-only review schema only after role/RLS and service-account security review.
- Derive submitter/reviewer from trusted server-side records, not browser input.
- Authenticated release persistence, review history API and E2E staging tests.

## Release rule
P1 modules may be developed and tested on explicit versioned candidate datasets. Claims about live connected scientific evidence, durable reviews or production integration require actual verified backend tests.
