# HSI scientific output validation — 2026-11-09

**Rule:** Every substantive scientific claim must be traceable to evidence, or clearly labelled inference / hypothesis / illustrative content.  
**Production tip:** `f2c24e3`

---

## 1. Homepage systemic sclerosis demonstration

| Field | Value | Validation |
|-------|-------|------------|
| Contract | `docs/research-demonstrations/demo_ssc_fibrosis_001.json` | Present |
| `live_backend` | `false` | PASS — must not be flipped silently |
| `review_status` | `not_reviewed` | PASS |
| `evidence` | `[]` | PASS — empty; UI must not invent PMIDs |
| Mechanism path | Immune activation → … → fibrosis | Illustrative only |
| UI labels | Illustrative / not live / curated | Present on production homepage |

**Verdict:** Acceptable as **illustrative product demonstration**. **Fail** if marketed as live literature-backed investigation.

---

## 2. Public educational graph

| Check | Status |
|-------|--------|
| Graph builders set `scientificApproval: false` | PASS (build output observed in `bun run check`) |
| Association ≠ causality messaging | Covered by unit tests historically |
| Production `/api/research/graph/ssc` anonymous | 401 fail-closed |

---

## 3. Science research workbench (`/science/research-agents` path family)

Code comment / UI: deterministic local foundation; **not connected autonomous AI agents**. Hypothesis generation explicitly withheld without reviewed evidence + validated reasoning service.

**Verdict:** Language is honest. Do not validate as operational agent orchestration (Phase 6 of brief).

---

## 4. Capability register honesty

`docs/capability-status.json`:

- `scientificallyValidatedClaimed: false`
- `writesEnabledClaimed: false`
- `gateCAutoApprove: false`
- `cdsPhiInHsi: false`
- `polishedUiImpliesCapability: false`

**Verdict:** PASS as governance artefact.

---

## 5. Live evidence retrieval (Phase 4 scenario)

**NOT TESTED** with authorised identity on production.  
Homepage demo does **not** retrieve PubMed/DOI records (`evidence: []`).

Any future live bind must update:

1. `demo_ssc_fibrosis_001.json` (`live_backend`, evidence array)
2. `PUB-SSC-DEMO` capability status
3. UI labels

---

## 6. Prohibited language scan (sample)

| Term | Public home | Notes |
|------|-------------|-------|
| Revolutionary AI / AI magic | Not observed | PASS |
| Guaranteed discovery | Explicitly listed under “does not do” | PASS |
| Clinically validated | Not claimed | PASS |
| Demo / mock as product identity | “Illustrative demonstration” disclosed | PASS if not overused as brand |
| Fake data | Not used | PASS |

---

## Acceptance

Scientific integrity for **public marketing**: PASS with disclosures.  
Scientific integrity for **live investigation outputs**: BLOCKED until authorised E2E produces provenance-bearing briefs.
