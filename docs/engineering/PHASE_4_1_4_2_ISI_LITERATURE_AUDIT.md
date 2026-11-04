# Phase 4.1 + 4.2 — ISI discovery and literature integration audit
Date: 2026-11-04

## Existing capabilities — reuse
- `src/evidence/europePmcSscDiscovery.ts`: live Europe PMC bibliographic search, paginated metadata, unreviewed classification.
- `src/evidenceIngestion.ts`: exact PMID metadata retrieval, hashed source records; no full-text licence assumption.
- `site/src/pages/ScienceLiterature.tsx`: public SSc literature browser and unreviewed publication dossier.
- `research/ssc-tfh-il21/curation-candidates.v1.json`: five unreviewed claim candidates.
- `research/ssc-tfh-il21/abstract-verification.v1.json`: three abstract-checked source records; independent review pending.
- `research/ssc-tfh-il21/study-extraction.v1.json`: study-level extraction with access and methodological limitations.
- `src/hsiResearchWorkbenchIntegration.ts`: authenticated research graph and evidence dossier coordinator.
- Existing scientific reviewer workflow and graph-release checks must remain authoritative.

## Implemented in this milestone
- `src/evidence/sscLiteratureVerification.ts`: joins SSc candidate claims to Europe PMC bibliographic records by PMID and DOI; reports missing/mismatched sources; never grants claim approval.
- `test/sscLiteratureVerification.test.ts`: positive metadata match, DOI mismatch, missing source, invalid promotion, duplicate claims and missing evidence locator.

## Critical distinctions
- Metadata match means the publication identifier and DOI match a retrieved record, **not** that the scientific claim is verified.
- An abstract-consistent claim remains an unreviewed candidate. Experimental model evidence cannot be recast as human clinical efficacy.
- The Ricard versus Ly disagreement requires denominator, gating, cohort and full-text methods review, not an automatic contradiction label.
- No automatic graph writes, patient data, autonomous scientific sign-off or publication are authorised.

## Follow-on work
1. Add trusted server-side retrieval and claim-evidence linking, rather than using the browser's direct Europe PMC search as an authoritative source.
2. Create persistent source snapshots, licence/retraction checks, structured extraction versioning and reviewer decision linkage.
3. Connect verified dossiers to authenticated research workbench; ensure claims without review remain draft.
4. Test live retrieval on staging with bounded requests and independent immunologist acceptance.
5. Expand from SSc to RA only after the SSc workflow is reproducible.

## Release status
Implementation committed, CI and live provider validation must be checked separately. This document does not claim staging or clinical validation.
