# Phase 2 — RA rights-verified licence import

**Date:** 2026-11-03  
**Verdict:** **HARD BLOCKED** (importer correctly refuses).  
**Not** scientific validation, Gate C approval, or permission to invent licence URIs.

## Preregistered pair

| Role | PMID | PMCID | DOI |
| --- | --- | --- | --- |
| cohort_candidate | 18375541 | PMC2596303 | 10.1136/ard.2007.084715 |
| meta_analysis_candidate | 24586782 | PMC3937352 | 10.1371/journal.pone.0089442 |

Protocol: `research/ra-anti-tnf/protocol.json`.  
Command: `bun run ra:import -- --cache-dir out/ra-sources --output research/ra-anti-tnf/release.json`.

## Fresh observations (operator network)

| Check | PMC2596303 | PMC3937352 |
| --- | --- | --- |
| Europe PMC MED core reachable | Yes | Yes |
| `isOpenAccess` | `Y` | `Y` |
| Europe PMC `license` token | `cc by` (unversioned) | `cc by` (unversioned) |
| JATS `permissions/license` `@xlink:href` / `href` | **Absent** | **Absent** |
| JATS `license-p` | Creative Commons Attribution prose only | Creative Commons Attribution prose only |
| Any `creativecommons.org` string in fullTextXML | **None** | **None** |
| Importer result | Rejects: not an explicit CC URI | Import aborts on first source before writing |

Live run raised:

```text
ValueError: Article licence is not an accepted explicit Creative Commons URI
```

`research/ra-anti-tnf/release.json` remains `awaiting_verified_source_import`. No passages or licence grants were invented. The unversioned Europe PMC token `cc by` was **not** mapped to a versioned Creative Commons URI (version is not attested in JATS).

Publisher HTML note (observation only, not used by the importer): PLOS ONE HTML for DOI 10.1371/journal.pone.0089442 exposed `http://creativecommons.org/licenses/by/4.0/` in this environment; BMJ/Europe PMC article HTML returned HTTP 403 here. Publisher HTML is outside the current JATS-only acceptance path.

## Binding policy preserved

- Explicit article-level CC BY or CC0 **URI** required (`creativecommons.org` path allow-list).
- NC / ND / SA / unknown / restricted text rejected.
- Do **not** invent Creative Commons URIs for PMIDs 18375541 / 24586782.
- Workflow / research-working-set success does **not** clear this gate.

## Unblock options (human-gated; pick one later)

1. **JATS catch-up** — re-run import when Europe PMC fullTextXML includes an explicit `license` URI for **both** preregistered articles.
2. **Protocol change** — replace or add sources whose JATS already carries an explicit CC BY/CC0 URI (new protocol version; do not silently swap IDs).
3. **Importer extension** — separately designed, receipted acceptance of a publisher-attested licence URI channel (not a free-text invent). Requires an explicit founder decision and tests; out of scope for this Phase 2 attempt.

## Downstream impact

| Workstream | Effect while blocked |
| --- | --- |
| Product corpus `ra-anti-tnf-evidence` | Stay `evidence_not_ready` (422) |
| `ra-anti-tnf-research` working set | Continues for investigation / practice labelling only |
| Phase 3 verified export | Blocked |
| Phase 6 `evaluation_frozen` rows | Blocked (practice rows only) |

## Honesty

Phase 2 did **not** fail because Europe PMC was unreachable. It failed because the preregistered articles still lack importer-acceptable explicit Creative Commons URIs in JATS. Weakening the URI check or fabricating versioned licences would violate project rights policy.
