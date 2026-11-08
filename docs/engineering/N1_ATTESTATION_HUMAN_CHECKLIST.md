# N1 #2 — fill-ready human principal attestation checklist

**Status:** Active **human** action for residual **#2** (eng-assist already merged; **not CLEARED**).  
**Do not** invent clearance, sign as principal from chat, set `humanCleared` / `passageImported`, or import passages.  
**Worksheet (fill this):** [`research/domain-graph/n1/attestation-worksheet.v1.json`](../../research/domain-graph/n1/attestation-worksheet.v1.json)  
**Eng lookup assist (read-only):** [`research/domain-graph/n1/licence-lookup-assist.v1.json`](../../research/domain-graph/n1/licence-lookup-assist.v1.json)  
**Eng notes:** [`N1_RIGHTS_PHASE2_ENG_ASSIST_NOTES.md`](./N1_RIGHTS_PHASE2_ENG_ASSIST_NOTES.md) · scaffold checklist: [`N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md`](./N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md)

Prefer **Metadata-only** when licence is ambiguous. Europe PMC OA/CC labels and Crossref eng observations are **not** corpus reuse permission.

## Decision vocabulary (for `attestation.decision`)

| Recommended decision | When | Typical `permittedUses` | `passageImportAuthorized` |
|----------------------|------|-------------------------|---------------------------|
| `metadata_only` | Ambiguous / NC / ND / non-CC userlicense / TDM-only / no publisher reuse URI yet | `["cite_metadata"]` | `false` |
| `attest_reuse` | Principal verified publisher VoR terms that allow HSI corpus storage/display of passages | Explicit list matching those terms (e.g. include passage scopes only if allowed) | `true` only if import is actually allowed |
| `blocked_need_counsel` | Terms conflict, paywall-only, identity doubt, or counsel required before any reuse claim | `[]` or `["cite_metadata"]` if bibliographic cite is still OK | `false` |

## Caution rows (quote eng candidates — human decides)

### N1-C-01 — candidate licence URI (NC-ND)

- **Candidate URI (eng observation only):** `https://creativecommons.org/licenses/by-nc-nd/3.0/`
- **Caution:** Crossref reports **CC BY-NC-ND 3.0** (vor). **NC** and **ND** usually block commercial reuse and derivatives. Prefer **`metadata_only`** unless the principal confirms HSI’s intended uses are permitted under NC-ND (or a different publisher statement). Do **not** treat Europe PMC label `cc by-nc-nd` alone as clearance.
- **Recommended human decision:** `metadata_only` (or `blocked_need_counsel` if commercial/corpus reuse is the goal)

### N1-C-07 — candidate licence URI (Elsevier OA userlicense, not CC)

- **Candidate URI (eng observation only):** `http://www.elsevier.com/open-access/userlicense/1.0/`
- **Also observed (TDM stubs, not reuse clearance):** `https://www.elsevier.com/tdm/userlicense/1.0/` · `https://www.elsevier.com/legal/tdmrep-license`
- **Caution:** Elsevier **OA userlicense** is **not** Creative Commons. Human must open the userlicense text and decide cite-metadata vs passage storage/display. Prefer **`metadata_only`** until passage scope is confirmed.
- **Recommended human decision:** `metadata_only` (escalate to `blocked_need_counsel` if userlicense is unclear for corpus use)

### N1-C-12 — CC URI under TDM-only Crossref row

- **CC URL under TDM-only (eng observation):** `https://creativecommons.org/licenses/by/4.0`
- **Caution:** Creative Commons BY 4.0 appears only under Crossref **`content-version=tdm`**. RA-style import **refuses TDM-only**. Europe PMC label `cc by` + OA=`Y` still ≠ VoR corpus clearance. Prefer **`metadata_only`** until the principal confirms a **VoR / publisher OA** statement (then reconsider `attest_reuse` only if that statement authorizes the intended uses).
- **Recommended human decision:** `metadata_only` until VoR confirmed

## Fill-ready table (all 12 `N1-C-*` rows)

For each row, edit **`rows[].attestation`** in `attestation-worksheet.v1.json` only. Do **not** invent stamps in `rights-inventory.v1.json` or copy eng URLs into `licenceEvidenceUri` without opening publisher terms.

| Queue | Title · DOI · PMID/PMC | Eng lookup | Recommended decision | Fields to fill (`attestation.*`) | Do **NOT** |
|-------|------------------------|------------|----------------------|----------------------------------|------------|
| **N1-C-01** | Butyrate improves insulin sensitivity… · `10.2337/db08-1637` · PMID `19366864` | `candidate_uri_observed` → `https://creativecommons.org/licenses/by-nc-nd/3.0/` (NC-ND) | **Metadata-only** (or Blocked-need counsel) | `decision` · `licenceEvidenceUri` (publisher/CC URI you verified) · `permittedUses` (e.g. `["cite_metadata"]`) · `principal` · `recordedAt` (ISO) · `rationale` (note NC-ND) · keep `passageImportAuthorized=false` | No passage import; no inventing NC-ND as full reuse |
| **N1-C-02** | Gut microbial metabolites… T1D · `10.1038/ni.3713` · PMID `28346408` | `tdm_or_publisher_stub_only` — Springer TDM stub only (`http://www.springer.com/tdm`); **no** reuse URI | **Metadata-only** | Same fields; `licenceEvidenceUri` = Nature Immunology / Springer VoR terms you opened (not TDM stub alone) · `passageImportAuthorized=false` | Do not treat TDM stub as clearance |
| **N1-C-03** | Human gut microbes impact host serum metabolome… · `10.1038/nature18646` · PMID `27409811` | `tdm_or_publisher_stub_only` — TDM-only; **none** candidate | **Metadata-only** | Same; open Nature VoR / publisher landing | No invent from empty Crossref licence |
| **N1-C-04** | A metagenome-wide association study… T2D · `10.1038/nature11450` · PMID `23023125` | `tdm_or_publisher_stub_only` — TDM-only; **none** candidate | **Metadata-only** | Same; open Nature VoR / publisher landing | No invent from TDM-only |
| **N1-C-05** | Disentangling T2D and metformin… microbiota · `10.1038/nature15766` · PMID `26633628` · PMC `PMC4681099` | `tdm_or_publisher_stub_only` — EPMC OA=`Y` but Crossref only Springer TDM stubs | **Metadata-only** | Same; OA at EPMC ≠ clearance; URI must be publisher VoR terms | No clearance from `isOpenAccess=Y` |
| **N1-C-06** | Gut bacteria selectively promoted by dietary fibers… · `10.1126/science.aao5774` · PMID `29590046` | `empty_crossref_licences` — **none** | **Metadata-only** | Same; open Science / AAAS landing + EPMC | No invent URI |
| **N1-C-07** | Microbially Produced Imidazole Propionate… · `10.1016/j.cell.2018.09.055` · PMID `30401435` | `candidate_uri_observed` → `http://www.elsevier.com/open-access/userlicense/1.0/` (not CC) | **Metadata-only** (or Blocked-need counsel) | Same; if attesting, URI = userlicense you read · rationale must state cite vs passage scope · `passageImportAuthorized=false` unless userlicense clearly allows import | Do not equate Elsevier OA userlicense with CC |
| **N1-C-08** | Obesity is associated with macrophage accumulation… · `10.1172/jci19246` · PMID `14679176` · PMC `PMC296995` | `empty_crossref_licences` — Crossref redirects to `10.1172/jci200319246`; empty license | **Metadata-only** (or Blocked-need counsel if identity unclear) | Same; **confirm DOI identity** on JCI landing before attesting · `licenceEvidenceUri` from JCI terms | Do not ignore DOI redirect |
| **N1-C-09** | Adipose expression of TNF-alpha… · `10.1126/science.7678183` · PMID `7678183` | `empty_crossref_licences` — **none** | **Metadata-only** | Same; open Science / AAAS landing | No invent URI |
| **N1-C-10** | The NLRP3 inflammasome… insulin resistance · `10.1038/nm.2279` · PMID `21217695` · PMC `PMC3076025` | `tdm_or_publisher_stub_only` — TDM-only; EPMC OA=`Y` ≠ clearance | **Metadata-only** | Same; open Nature Medicine VoR terms | No clearance from OA flag |
| **N1-C-11** | Metabolic endotoxemia initiates obesity… · `10.2337/db06-1491` · PMID `17456850` | `empty_crossref_licences` — **none** | **Metadata-only** | Same; open Diabetes / ADA landing | No invent URI |
| **N1-C-12** | The human gut microbiome in early-onset T1D (TEDDY) · `10.1038/s41586-018-0620-2` · PMID `30356183` · PMC `PMC6296767` | `cc_uri_under_tdm_only` → `https://creativecommons.org/licenses/by/4.0` (**TDM-only** row) | **Metadata-only** until VoR confirmed | Same; only move to `attest_reuse` after VoR/publisher OA confirms BY 4.0 for intended uses · keep `passageImportAuthorized=false` until then | Do not auto-clear from TDM-only CC URL or EPMC `cc by` |

## Worksheet field template (per row)

```json
"attestation": {
  "decision": "metadata_only",
  "principal": "<real accountable human / role — not invented>",
  "recordedAt": "<ISO-8601 when principal attests>",
  "licenceEvidenceUri": "<publisher terms or OA statement URI you opened>",
  "permittedUses": ["cite_metadata"],
  "rationale": "<short honest note: what you opened and why this decision>",
  "passageImportAuthorized": false
}
```

Leave `passageImportAuthorized` **false** unless `decision` is `attest_reuse` **and** the verified terms allow passage import. A separate import step (not this checklist) is required before any `passageImported` counter may move.

## What NOT to do

1. Do **not** invent `licenceEvidenceUri` / `principal` / signatures from eng-assist or this chat.  
2. Do **not** copy eng `candidateEvidenceUrls` into the worksheet without opening and accepting those terms yourself.  
3. Do **not** set `passageImported` / inventory `passageUsePermitted` / claim `rightsCleared=true` / Gate C / MoU.  
4. Do **not** import passage text until authorized and a later import step runs.  
5. Do **not** start residual **#4** (SME gold) or **#5** (live journey) as a substitute for this attestation.  
6. Do **not** point HSI Neon at autumn-snow.

## Verify

### Before any worksheet fill (current eng-assist baseline)

```sh
bun run n1:attestation:check
bun run n1:check
bun run human-queue:check
bun --no-env-file test test/n1LicenceLookupAssist.test.ts test/n1PassageRightsInventory.test.ts test/humanQueueResidualPrep.test.ts
```

**Expected now:** `rightsCleared=false` · `humanCleared=0` · `passageImported=0` · `stillNeedsHumanPrincipal=12` · gate `FAIL_CLOSED_INCOMPLETE` · worksheet `anyLicenceEvidenceUriSet=false` · `humanAcceptance=BLOCKED`.

### After honest human fills (status transitions to expect)

| Checkpoint | Expect |
|------------|--------|
| Partial fill (some of 12) | Attested rows have non-null `decision` · `principal` · `licenceEvidenceUri` · non-empty `permittedUses`; **unfilled** rows stay null/`[]`; `passageImported` still **0**; do **not** claim residual CLEARED |
| All 12 metadata-only (or mix with blocked) | `pending` → 0 for attestation completeness once eng stamp-path accepts filled worksheets; `humanCleared` rises only for rows the programme treats as cleared under its rules; **prefer** still `passageImportAuthorized=false` / `passageImported=0` |
| Any `attest_reuse` | Only those rows may set `passageImportAuthorized=true`; import remains a **separate** step — `passageImported` stays 0 until that step |
| `human-queue:check` | Residual `#2` stays **HUMAN_BLOCKED** until programme lead accepts attestation as complete; never CLEARED from eng-assist alone |

**Honesty note:** Today’s eng parsers/gates intentionally **refuse invented or premature clearance** and still expect an empty worksheet until a human stamp-path is wired. If checks fail after a real fill with “stamp path not yet wired” / parse refusal, that is an **eng follow-on** — do not invent counters in git to force green. Record principal decisions honestly in the worksheet (or private counsel notes first), then re-run:

```sh
bun run n1:attestation:check
bun run human-queue:check
```

## Next after #2 (not this PR)

- **#4** SME dual labels + adjudication  
- **#5** Live authenticated Ask→…→Export (+ staging two-account)
