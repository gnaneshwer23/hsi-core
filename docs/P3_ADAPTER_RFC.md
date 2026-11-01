# P3 adapter RFC — ModelProposalArtifacts only

**Status:** Written RFC + license matrix (P2.5). **No adapters vendored. No model weights in-repo.**  
**Schema:** `hsi-p3-adapter-license-matrix-1` → regenerable `hsi-p3-adapter-license-matrix.json`  
**Code:** `src/p3AdapterLicenseMatrix.ts` · stubs in `src/systemsAxes.ts` (`FUTURE_TECH_ADAPTER_STUBS`)  
**Position:** [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md) · portfolio: [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md)

---

## 1. Purpose

Define how optional bio / ML shelf adapters (TDC, AlphaFold3, Boltz, ESM, OpenMM, RDKit, REINVENT4, …) may eventually plug into the HSI stack **without** becoming evidence authority, flipping grades, vendoring multi-GB weights, or claiming commercial licenses that have not been signed.

This RFC is the **gate document**. Implementation of runnable adapters is **out of scope** until:

1. This RFC stays binding.  
2. The machine-readable license matrix entry for that adapter has an honest `signOffStatus`.  
3. `blockedUntilSignOff=false` **or** a written human sign-off is recorded in-repo (never invented).  
4. Outputs still emit **ModelProposalArtifacts** only → Gate C pending.

---

## 2. Hard invariants (non-negotiable)

| Invariant | Meaning |
|-----------|---------|
| **Proposals only** | Adapters emit `ModelProposalArtifact` (`src/modelProposal.ts`) — never graded KG edges. |
| **Gate C human** | Proposals become Gate C `modelProposals` rows with `gateCStatus=pending`, `autoApprove=false`. |
| **No grade flips** | `mayFlipEvidenceGrade=false` on every adapter; forbidden fields include `hsiGrade` / `curationReview`. |
| **License before run** | Do not execute / download / wire an adapter while its matrix row has `blockedUntilSignOff=true`. |
| **No weight vendoring** | Never commit AF3/Boltz/ESM/etc. weights into `hsi-core`. Hash/ref sidecars only (P2.2). |
| **No PHI sequences** | Clinic / identifiable sequences never enter HSI Neon (`red-wave`) or adapter prompts from this workspace. |
| **No clinic path** | Generative chem / structure scores never become Aksh CDS or dosing recommendations from research packs. |
| **Honest sign-off** | `signOffStatus` ∈ `not_signed` · `needs_review` · `non_commercial_only` · `research_ok_documented`. Never claim commercial licenses signed without evidence. |

**Exported:** `autoApproveIntoKg=false` · `vendorsModelWeights=false` · packs remain authority.

---

## 3. Data flow

```text
  External bio/ML tool (P3)          hsi-core
  ┌─────────────────────┐            ┌──────────────────────────────┐
  │ TDC / AF3 / Boltz / │  scores,   │ ModelProposalArtifact        │
  │ ESM / OpenMM /      │  ranks,    │  (typed draft; no hsiGrade)   │
  │ RDKit / REINVENT4   │  hyps  ──► │           │                  │
  └─────────────────────┘            │           ▼                  │
       ▲ license gate                │ Gate C checklist             │
       │ (matrix)                    │  modelProposals · pending    │
       │                             │           │                  │
       └─ blockedUntilSignOff?       │           ▼ human            │
                                     │ ISI Neon approve (out-of-repo)│
                                     └──────────────────────────────┘
```

Offline eval (P2.3) may later score adapter proposals against frozen packs; TDC-style retrieval metrics remain deferred until an adapter is unblocked.

---

## 4. Adapter contract

Each future adapter module (ISI lab lane or thin hsi-core CLI — **not shipped yet**) MUST:

1. Read its row from `hsi-p3-adapter-license-matrix.json`.  
2. Refuse to run if `blockedUntilSignOff=true` or `mayFlipEvidenceGrade` would be true.  
3. Emit only objects that pass `assertSafeModelProposal`.  
4. Set `sourceAdapterOrAgent` to the matrix `adapterId` (e.g. `adapter-boltz`).  
5. Default `suggestedTeachingStatus` to `hypothesized` unless evidenceHints already cite seeded pack edges.  
6. Never write `hsiGrade`, never set `autoApprove`, never upload PHI, never vendor weights into git.

Optional later: attach embedding sidecars (P2.2) or genome pointers (P2.4) as **citation metadata** only — still `doesNotSetHsiGrade`.

---

## 5. License matrix (summary)

Full machine-readable rows: publish artifact `hsi-p3-adapter-license-matrix.json` (source of truth in `src/p3AdapterLicenseMatrix.ts`).

| adapterId | Purpose (short) | signOffStatus | blockedUntilSignOff |
|-----------|-----------------|---------------|---------------------|
| `adapter-tdc` | Offline ML eval / benchmarks vs graded claims | `needs_review` | **true** (per-dataset licenses) |
| `adapter-af3` | Structure hypotheses | `non_commercial_only` (weights terms) | **true** |
| `adapter-boltz` | Open structure / affinity alternative | `research_ok_documented` (MIT code+weights) | false |
| `adapter-esm` | Protein embeddings (FAIR ESM-2 shelf) | `research_ok_documented` (MIT FAIR); EvolutionaryScale variants = separate review | false for FAIR ESM-2 only |
| `adapter-openmm` | MD simulation | `research_ok_documented` | false |
| `adapter-rdkit` | Cheminformatics descriptors | `research_ok_documented` | false |
| `adapter-reinvent4` | Generative design sandbox | `research_ok_documented` | false |
| `adapter-isi-agents` | ISI 12-agent runtime (pattern only) | `not_signed` | **true** (runtime out of repo) |

**Docs URLs** on each row point at upstream LICENSE / weights terms / project pages — not invented MoUs.

---

## 6. What “sign-off” means

| Status | Honest meaning |
|--------|----------------|
| `not_signed` | No written org/counsel acceptance recorded in hsi-core. |
| `needs_review` | Public terms exist but vary or are ambiguous for our use — human must pick a permitted subset before run. |
| `non_commercial_only` | Upstream terms allow research/non-commercial use under cited conditions; commercial use remains blocked. |
| `research_ok_documented` | Public permissive license documented with URL; research/discovery use assessed OK under that license — **still** no grade flips, no weight vendoring, no clinic path. |

Flipping `blockedUntilSignOff` from `true` → `false` requires a PR that cites the reviewed URL + short rationale in the matrix `notes` / `signOffEvidence` — never a silent toggle.

---

## 7. Explicit non-goals (this RFC)

- Vendoring AF3 / Boltz / ESM / REINVENT weights or containers into `hsi-core`.  
- Claiming commercial AF3 weights rights or EvolutionaryScale commercial licenses without evidence.  
- Auto Gate C / model-set `hsiGrade`.  
- Live CDS, PHI sequences, shared Neon with immunecity / Akeno.  
- Editing immunecity / DeliverX / hsi-sources from this workspace.  
- Treating structure/affinity scores as clinical efficacy.

---

## 8. Definition of done (P2.5)

| Criterion | Done |
|-----------|------|
| This RFC committed under `docs/P3_ADAPTER_RFC.md` | Yes |
| Machine-readable matrix published + tested | Yes (`hsi-p3-adapter-license-matrix.json`) |
| Every adapter `mayFlipEvidenceGrade=false`, `vendorsModelWeights=false` | Yes (invariants) |
| No commercial “signed” claim without evidence | Yes |
| MANIFEST / OUTPUTS / BUILD_STATUS updated; next phase named | Yes |
| Runnable adapter code / weight download | **Not** in scope — later P3 implementation after unblock |

---

## 9. Recommended next phase

**P3.0 — first unblocked thin adapter spike (docs + dry-run only preferred):** pick one `blockedUntilSignOff=false` adapter (likely RDKit or Boltz **without** vendoring weights) and specify a **proposal-only** CLI contract + offline eval case — still no grade flips. Partner P0.2 remains the parallel critical path.

---

## Cross-links

- Build status: [`BUILD_STATUS_AND_NEXT.md`](./BUILD_STATUS_AND_NEXT.md)  
- Outputs: [`OUTPUTS.md`](./OUTPUTS.md)  
- Systems map: [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md)  
- AI position: [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md)  
- Model proposals: `src/modelProposal.ts` · Gate C `modelProposals`  
- License matrix: `src/p3AdapterLicenseMatrix.ts`
