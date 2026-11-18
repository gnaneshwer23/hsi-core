# Phase 0 — Existing vs missing gap matrix

**Audited:** 18 November 2026 · `main` @ `27e5eedf`  
**Status key:** WORKING · PARTIAL · MOCKED · BLOCKED · MISSING · UNVERIFIED

| Capability | Current implementation | Status | Missing / broken | Required change | Test evidence today | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Public Home / About / Contact | Live pages + nav | WORKING | Premium Stage-1 token cutover not on main | Apply brand tokens after #465; keep honesty | e2e landing / production-qa | P2 |
| Public Platform / Science | Redirects to how-it-works / KG | PARTIAL | Named marketing pages retired | Either restore approved comps or keep redirects + IA honesty | legacy-redirects e2e | P2 |
| Researchers / Biotech pages | — | MISSING | Routes absent | Add pages only after Stage-1 comps; map CTAs to real enquiry | none | P2 |
| Public Validation / Trust | `/trust` live; `/validation` absent | PARTIAL | Spec wants `/validation` | Interim: content on `/trust`; optional later route | nav honesty tests | P2 |
| Contact / beta enquiry | Draft + optional access-requests API | PARTIAL | Delivery env often unset | Configure Resend/webhook in staging; never fake success | `accessRequestHandler.test.ts`, product-experience e2e | P0 |
| Auth signup / verify / login / reset | Neon Auth gateway + pages | PARTIAL | Workspace grant separate; not open signup→write | Keep provider; document grant gate; harden session expiry UX | hsiAuth / passwordRecovery / vercelResearch tests | P0 |
| Tenant isolation (live) | Unit gates + isolation probe suite | PARTIAL | Signed two-researcher HTTP acceptance missing | Run owner-enabled staging isolation suite; do not enable prod writes | `isolationProbeCatalog.test.ts`, workspace tests | P0 |
| Researcher onboarding | Welcome + ResearchHome wizard | PARTIAL | **Backend persist MISSING** (localStorage) | Server profile store (023 held → additive path or owned migration packet) | welcome / research-home e2e (local only) | P1 |
| Researcher dashboard | UI + honesty empty states | PARTIAL | Live data when writes off | Wire list to verified owner; keep empty/denied states | research-dashboard e2e (mocked) | P1 |
| Investigation Ask→brief E2E | Handlers + orchestrator + UI | BLOCKED | Production `writesEnabled=false`; durable path incomplete | Staging write path under fail-closed gates after #5 | liveInvestigation / investigationWorkspace tests | P1 |
| Evidence ingestion | Multiple bibliographic adapters | PARTIAL | Rights clearance #2; retraction/refresh gaps | Clearance policy (#442) + receipt-bound retrieval | liveSources / clearance unit tests | P0 |
| Context Passport | Library + UI on graph surfaces | PARTIAL | Not universal on live Ask path; passage fields thin | Default passport panel on investigation + completion sheet import | passport unit tests; graph e2e partial | P1 |
| Context comparison | Domain compare UI + structured comparison | PARTIAL | Expert-calibrated rules incomplete | Bind comparison classes to verification before “contradiction” | structuredEvidenceComparison tests | P1 |
| Knowledge graph / mechanisms | Domain/claim graphs; HELIX/SSc packs | PARTIAL | 0 approved edges; thin coverage | Curate reviewed slice; no silent AI promotion | domain graph tests; honesty copy | P1 |
| Scientific verification | Dual-model harness (#275) + review stores | BLOCKED | No SME gold; providers not production-accepted | Bind two providers in staging; adjudicate gold (#4) | dualModel / reliability harness unit tests | P1 |
| Contradiction / gaps | Gap index + ledger code | BLOCKED | Neon migrations held | Activate only after isolation packet | gapVerification tests | P1 |
| Research briefs save/export | Fixture/domain/live render exports | PARTIAL | Server versioned decision memory held (022) | Immutable outcome versions + reopen/export in staging | brief export unit/e2e partial | P2 |
| Decision memory / resume | Contracts + review history stubs | BLOCKED | Longitudinal overwrite-safe store | Minimal versioned outcomes for 1.0; deep evolution = 2.0 | contract tests | P1 |
| Monitoring / reliability | Ops alert catalog soft-land | PARTIAL | Real on-call delivery / soak unaccepted | Wire staging dry-run destination; keep fail-closed | opsAlertCatalog tests | P0 |
| CI / typecheck / security scans | GHA workflows | WORKING | Scientific acceptance not in CI | Keep green; add journey smoke when staging ready | research-foundation workflow | P0 |
| Hypothesis intelligence | Ledgers / falsifiers / contracts | PARTIAL | Later-band product | Keep labelled; no 1.0 must-ship | hypothesis registry tests | P3 |
| Six-domain equal depth | Taxonomy + uneven packs | PARTIAL | Coverage unequal; SSc validation case | One workflow; expand domains after E2E | STATUS / packs | P3 |

---

## Critical path (dependency order)

```
P0 clearance + auth/isolation honesty
  → P0/P1 staging writes (#5) under fail-closed gates
    → P1 Context Passport on investigation path
      → P1 verification with dual providers + gold (#4)
        → P1 Ask→brief→export owned by verified user
          → P2 premium site + server onboarding polish
            → P3 hypothesis intelligence
```

Do **not** start with a homepage redesign as the next engineering centre of gravity.
