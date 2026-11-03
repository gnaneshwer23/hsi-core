# RA/anti-TNF evidence release: implementation and current limits

The recovered step-4 implementation is committed for inspection. It adds a
preregistered source protocol, an operator-side Europe PMC importer, a strict
release validator and a bounded view of three existing ISI KG relationships.
It does not establish scientific approval, production activation or a completed
context-tagging benchmark.

## Current state

`research/ra-anti-tnf/release.json` explicitly says
`awaiting_verified_source_import`. The current runtime network policy blocks the
Europe PMC source endpoint. No publication passage or reuse-rights observation
has been invented to fill that gap. Earlier source-registry notes are candidate
locators, not a fresh source verification. The proposed network additions were
saved to the environment configuration draft; saving did not apply them.

The candidate pair is the existing cohort locator PMID 18375541 / PMC2596303 and
meta-analysis locator PMID 24586782 / PMC3937352. Import requires fresh matching
PMID, PMCID and DOI in Europe PMC MED metadata and JATS front matter. A mismatch
rejects the entire import and preserves the previous output file.

## Implemented boundary

- Operator command: `bun run ra:import --cache-dir out/ra-sources --output research/ra-anti-tnf/release.json`.
- Requests use the normal proxy and TLS verification. Source redirects stay on
  the registered HTTPS Europe PMC origin; raw downloads are bounded.
- The importer accepts explicit article-level CC BY or CC0 URIs with recorded
  authors. NC/ND/SA, unclear, restricted or conflicting reuse terms are outside
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

This commit provides the import/validation foundation. A verified source import,
product corpus registration/passage-review UI, the expert-labelled context
benchmark and independent scientific adjudication remain outstanding. Existing
Aksh/ISI database activation prerequisites also remain as documented in
[product backend activation](INVESTIGATION_PRODUCT_BACKENDS.md).
