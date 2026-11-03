# Phase 2 — RA rights-verified licence import

**Date:** 2026-11-03  
**Verdict:** **CLEARED** (protocol v2; Crossref works licence attestation).  
**Not** scientific validation, Gate C approval, or KG write permission.

## Preregistered pair (unchanged)

| Role | PMID | PMCID | DOI | Licence (attested) |
| --- | --- | --- | --- | --- |
| cohort_candidate | 18375541 | PMC2596303 | 10.1136/ard.2007.084715 | `https://creativecommons.org/licenses/by/2.0/` |
| meta_analysis_candidate | 24586782 | PMC3937352 | 10.1371/journal.pone.0089442 | `https://creativecommons.org/licenses/by/4.0/` |

Protocol: `research/ra-anti-tnf/protocol.json` **version 2**.  
Command: `bun run ra:import -- --cache-dir out/ra-sources --output research/ra-anti-tnf/release.json`.

## How clearance was achieved

JATS for both articles still lacks `license` `@href` / `@xlink:href` (Attribution prose only; Europe PMC token remains unversioned `cc by`). Inventing a versioned URI from that token remains forbidden.

Founder instruction **clear phase 2** authorized unblock option 3: a **receipted Crossref works** licence channel when JATS has permissions prose but no URI:

1. Europe PMC MED + fullTextXML still required (identity, OA, exact abstract passages).
2. If JATS has no CC URI → fetch `https://api.crossref.org/works/{doi}` with cache receipt.
3. Accept only `content-version` **vor** or **unspecified** licence URLs that pass the existing CC BY / CC0 allow-list.
4. Ignore Crossref **tdm** rows (e.g. Elsevier TDM licences on the ARD record).
5. Record `licenceAttestation: "crossref_works"` + Crossref retrieval proof on each receipt (never invent URIs).

Live import result: **2 sources, 8 passages**, `scientificReview: unreviewed`, both attestations `crossref_works`.  
`raEvidenceReadiness.available === true`.

## Binding policy preserved

- Explicit CC BY or CC0 **URI** still required (now from JATS **or** Crossref works).
- NC / ND / SA / unknown / restricted rejected.
- Unversioned Europe PMC `cc by` is **not** mapped to a versioned path.
- Workflow success is **not** scientific approval.

## Downstream impact

| Workstream | Effect |
| --- | --- |
| Product corpus `ra-anti-tnf-evidence` | Ready for Phase 3 verified export |
| `ra-anti-tnf-research` working set | Continues for practice labelling |
| Phase 3 verified export | Unblocked — see [`PHASE3_RA_VERIFIED_EXPORT.md`](./PHASE3_RA_VERIFIED_EXPORT.md) |
| Phase 6 `evaluation_frozen` rows | Still needs human annotation after export |

## Honesty

Phase 2 cleared because Crossref attested versioned CC BY URIs for both DOIs with download receipts — not because the JATS URI gap disappeared, and not by inventing licences.
