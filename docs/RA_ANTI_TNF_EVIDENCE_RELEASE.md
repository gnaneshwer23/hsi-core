# RA/anti-TNF evidence release: implementation and current limits

The recovered step-4 implementation is committed for inspection. It adds a
preregistered source protocol, an operator-side Europe PMC importer, a strict
release validator and a bounded view of three existing ISI KG relationships.
It does not establish scientific approval, production activation or a completed
context-tagging benchmark.

## Current state

`research/ra-anti-tnf/release.json` is a **rights-verified, scientifically
unreviewed** import (protocol v2): 2 sources, 8 exact abstract passages.
Licence URIs come from receipted Crossref works records (`licenceAttestation:
crossref_works`) because JATS permissions still lack `@href`. See
[PHASE2_RA_LICENCE_IMPORT.md](PHASE2_RA_LICENCE_IMPORT.md). This is **not**
scientific approval or Gate C clearance.

The candidate pair remains cohort locator PMID 18375541 / PMC2596303 and
meta-analysis locator PMID 24586782 / PMC3937352. Import requires fresh matching
PMID, PMCID and DOI in Europe PMC MED metadata and JATS front matter. A mismatch
rejects the entire import and preserves the previous output file.

## Implemented boundary

- Operator command: `bun run ra:import --cache-dir out/ra-sources --output research/ra-anti-tnf/release.json`.
- Requests use the normal proxy and TLS verification. Source redirects stay on
  the registered HTTPS Europe PMC origin; raw downloads are bounded.
- The importer accepts explicit article-level CC BY or CC0 URIs with recorded
  authors — from JATS `license` `@href` when present, otherwise from a receipted
  Crossref works licence URL (`vor` / `unspecified` only; never TDM-only; never
  invented). NC/ND/SA, unclear, restricted or conflicting reuse terms are outside
  this release policy. This is a conservative project policy, not a statement
  that every other licence prohibits all commercial use.
- Only complete abstract paragraphs are extracted. JATS paths, normalization,
  paragraph hashes, source XML hashes, request URLs and retrieval dates remain
  traceable. Reference-list identifiers cannot substitute for article identity.
- UTF-8 XML only; internal entity declarations are rejected and external DTDs
  are not fetched. Retraction/withdrawal flags trigger rejection; absence of a
  flag is not a guarantee that a publication is currently unretracted.
- JSON validation preserves both planned source roles and rejects automatic
  scientific approval, inferred study design and false exact-relationship support.
- Dossier Markdown now retains article URLs and reuse-licence identifiers;
  imported citations retain authors, title, source version and normalization.

Cache receipts and hashes establish reproducibility and detect byte changes;
they are not cryptographic publisher attestations. Offline mode checks previously
downloaded bytes/receipts and does not prove fresh provider access. Source rights,
publication status and scientific interpretation still need appropriate review.

## Scientific distinction

The question concerns RF/anti-CCP and response heterogeneity. A null association
for a predictive biomarker does not refute anti-TNF efficacy in RA. The existing
ISI relationships `REL-I032-treats-D001`, `REL-I032-targets-M001` and
`REL-M001-contributes_to-D001` provide research context only. The importer creates
zero claims that pretend to prove these relationships from serology passages.
No second global KG or automatic Gate C approval is introduced.

## Verification and remaining integration

`bun run test` covers the release boundary and existing research service.
`bun run ra:test-parser` covers licence restrictions, exact text/locators,
identity ambiguity, references, attribution, entity declarations and the refusal
to turn TEST-* identifiers into a production release. Structural contract
fixtures are not primary-source evidence and are never exported as product data.

Operator export (after committing canonical research files):

```sh
bun run ra:export-artifact -- isi aksh
```

This writes a versioned research-artifact snapshot (not executable code) into
each product checkout. An unavailable import must not overwrite a previously
valid product release. Product loaders register `ra-anti-tnf-evidence` with
explicit readiness metadata and return `evidence_not_ready` when start is
attempted against a pending marker. Passage-review UI consumes only bundle
sources/passages already returned by the investigation service.

**Current verification note (2026-11-03, Phase 2 CLEARED):** Europe PMC + Crossref
reachable. JATS still lacks licence `@href`; Crossref attested CC BY 2.0 (PMID
18375541) and CC BY 4.0 (PMID 24586782). Import wrote exact passages with
`scientificReview: unreviewed`. Report: [PHASE2_RA_LICENCE_IMPORT.md](PHASE2_RA_LICENCE_IMPORT.md).
Phase 3 product install: [PHASE3_RA_VERIFIED_EXPORT.md](PHASE3_RA_VERIFIED_EXPORT.md).

The expert-labelled context benchmark and independent scientific adjudication
remain outstanding. Annotation guideline/worksheet templates ship without
labels. Existing Aksh/ISI database activation prerequisites also remain as
documented in [product backend activation](INVESTIGATION_PRODUCT_BACKENDS.md).

## Research working-set corpus (investigation readiness)

A separate corpus `ra-anti-tnf-research` ships under
`research/ra-anti-tnf-research/` with `corpusKind=research_working_set` and
`notForScientificClaim=true`. Human-facing labels use `RS-*`;
contract IDs are `SYN-RA-SRC-*` (synthetic namespace). Passage text is
authored working-set content under CC0 — not a quotation and not a licence grant
for real PMIDs. Product loaders register this corpus for authenticated investigation
workflows alongside the rights-verified evidence corpus. See
[RA research path](RA_RESEARCH_PATH.md).
