# HSI Agent Evaluation Framework (§5.16)

**Document status:** Multi-level evaluation design for tools, agents, workflows, clinical and research use  
**Rule:** Establish **baselines before numerical targets**. Do not invent production-ready scores.  
**Existing seeds:** hsi-core 150 tests; ISI Ask/graph/HSI tests; Aksh orchestration + `eval:agents` goldens (**Partial**).

---

## 1. Evaluation layers

| Layer | Questions | Example metrics |
|-------|-----------|-----------------|
| **Tool** | Does the API do what it claims? | Correctness, reliability, latency, schema compliance, ACL deny accuracy |
| **Agent / capability** | Does the worker complete the task honestly? | Task completion, grounding, citation accuracy, unsupported-claim rate, failure handling |
| **Workflow** | Does A–E end-to-end hold? | E2E accuracy, cross-capability consistency, reproducibility, usefulness, reviewer agreement |
| **Clinical** | Safe for care context? | Data accuracy, safety incidents, missing-info handling, HITL accept/edit/reject quality |
| **Research** | Scientifically credible? | Coverage, mechanism validity, contradiction recall, hypothesis usefulness, expert assessment |

---

## 2. Baselines first

| Step | Action | Status |
|------|--------|--------|
| 1 | Freeze golden sets versioned with graph/pack commit | **Proposed** for M1; Aksh goldens **Partial** |
| 2 | Run current Ask/engine/Cite Check / CONDUCTOR sim → record baseline | **Partial** (tests exist; board metrics not formalised) |
| 3 | Only then set release thresholds (Aksh pattern: `minDecided`, max rejection — still `targetsConfirmedBy: null`) | Clinical targets **Proposed** until CSO confirms |
| 4 | No MHRA/clinical validation claim from eval alone | Binding |

---

## 3. Golden sets

| Set | Scope | Contents | Owner |
|-----|-------|----------|-------|
| **G-Ask** | Cap 12 / Workflow B | Questions → required concept ids, must-cite PMIDs, refuse cases | ISI |
| **G-Mech** | Cap 8 | Disease → pathway REL-* / pack edges; forbidden causal overclaims | ISI + hsi-core |
| **G-Cite** | L5 | Identifier Check statuses; support unassessed rows | ISI |
| **G-Clinical** | Caps 1–6 | Synthetic cases; red-flag / med interaction; HITL expected | Aksh |
| **G-Trial** | Caps 16–18 | Criteria → five states; **zero** confirmed-eligible labels | Trials (future) |
| **G-Hyp** | Cap 15 | Required fields present; always unvalidated | ISI |

---

## 4. Metric catalogue (measure; targets TBD)

### Tool-level

- Schema compliance rate  
- p95 latency  
- ACL false-allow (=0 goal after baseline)  
- Freshness lag (trials)

### Agent-level

- Citation precision / recall vs gold  
- Unsupported-claim rate  
- Entity resolution accuracy  
- Fail-closed correctness on tool error  

### Workflow-level

- Brief reproducibility (same inputs → same claim set)  
- Human reviewer agreement (κ baseline)  
- Cross-agent consistency (no conflicting composite scores)

### Clinical

- HITL rejection rate (monitor, not vanity)  
- Hazard set coverage (GUARDIAN red interactions)  
- `syntheticOnly` honesty on exports  

### Research

- Contradiction detection recall (when gold contradictions exist)  
- Gap precision (absence ≠ nonexistence — penalise overclaim)  
- Expert usefulness Likert baseline  

---

## 5. Mapping to existing harnesses

| Harness | Status | Use |
|---------|--------|-----|
| `bun test` hsi-core | **Verified** | Packs, cdsPhi, catalog |
| ISI ask-* / hsi-phase0 | **Verified** / Partial | Grounding, Gate C honesty |
| Aksh clinical-proof / agent-loop | **Verified** (sim) | CONDUCTOR peers |
| Aksh `eval:agents` | **Partial** | Expand for release criteria |
| Workflow B M1 e2e | **Proposed** | Product roadmap Phase 2 |

---

## 6. Release posture

- Simulation eval ≠ clinical release (`LIVE_ORGANISATIONS` stays 0 until safety case).  
- Research brief M1 can ship as **research aid** when G-Ask/G-Mech baselines + citation floors met — still not CDS.  
- Named Type D investigators promote only after agent-level bars beat tool-pipeline baseline.

**Stop:** No numeric “90% accuracy” marketing without measured baselines and founder/CSO confirmation.
