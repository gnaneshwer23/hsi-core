# HSI landing page integration QA

**Date:** 2026-11-09  
**Branch:** `eng/landing-page-backend-matrix-phase8`  
**Production tip at audit start:** `864710a`  
**Rule:** Document disconnected features with root cause; repairs must not invent backends or claim PASS without evidence.

---

## 1. Disconnected / weak features found

| ID | Feature | Symptom | Root cause | Severity |
|----|---------|---------|------------|----------|
| D01 | “Open research brief” | Scrolled to demo; brief tab stayed closed | Hash `#product-demo` only; panel state defaulted to mechanism | P1 UX honesty |
| D02 | “Open brief workflow” | Label promised brief; navigated to `/how-it-works` | Hardcoded label over `PUBLIC_SECONDARY_CTA` | P2 honesty |
| D03 | Homepage scenario/domain | Lost on navigation; not shareable | `useState` only; no query contract | P2 context |
| D04 | Access request CTA | `/contact` looks like a request sink | No form/API write; grants are admin-provisioned | P0 product honesty |
| D05 | Research nav “Investigation” | Landed on workbench without id | Link omitted `?investigation=` | P1 UX |
| D06 | Dashboard “Decision workbench” | Same as D05 | Bare path | P1 UX |
| D07 | `?view=briefs` | Looked like brief library | Headline switch only | P2 honesty |
| D08 | Research landing copy | Read as SSc-only product | Legacy framing | P2 domain independence |
| D09 | Programme / gaps routes | Journey dead-ends | No entity/route (R03/R10) | P1 IA — **deferred** (needs schema PR) |
| D10 | Sign-in `next` return | Context lost after auth | SignIn/SignUp ignore `next` | P2 — **deferred** |
| D11 | capability-status.json | CTA chips hand-maintained | Site does not import JSON; secondary CTA drifts from registry (`See How It Works` vs `Explore the platform`) | P3 — documented; not auto-wired this PR |

---

## 2. Proposed / shipped repairs

| ID | Repair | Status |
|----|--------|--------|
| D01 | `homeDemoHref({panel:"brief"})` + `HomeProductDemo` reads `?panel=` / hash | **Shipped** |
| D02 | Brief artefact CTA uses `PUBLIC_SECONDARY_CTA.label` | **Shipped** |
| D03 | `researchContext.ts` + Home `?scenario=` sync | **Shipped** (demo only; not forced onto KG/contact) |
| D04 | Contact honesty: “This page does not store an access request…” | **Shipped** (persistence still BLOCKED) |
| D05–D06 | Nav/dashboard → `#dashboard-workspace` until id exists | **Shipped** |
| D07 | Briefs view footnote on dashboard | **Shipped** |
| D08 | Research landing: SSc = validation case | **Shipped** |
| D09 | Programme + gaps | **Deferred** — see `HSI_MISSING_INTEGRATIONS.md` PR-D/E |
| D10 | SignIn/SignUp `next` | **Deferred** |
| D11 | Build-time capability chip import | **Deferred** (avoid silent CTA rewrite without design pass) |

---

## 3. Production probes (executed)

| Probe | Result | Evidence |
|-------|--------|----------|
| `GET /` | **200** | curl 2026-11-09 |
| `GET /contact` | **200** | curl |
| `GET /api/research/health` | **200** `writesEnabled=false`, red-wave prefixes match | JSON snapshot |
| `GET /api/research/investigations` | **401** | Fail-closed anon |

```json
{
  "service": "hsi-research",
  "status": "configuration_validated",
  "writesEnabled": false,
  "endpointPrefixesMatch": true,
  "databaseConnectionTested": false
}
```

---

## 4. Automated test results (this branch)

| Command | Result |
|---------|--------|
| `bun test ./test/researchContext.test.ts ./test/homeResearchScenarios.test.ts ./test/publicSiteHonesty.test.ts` | **17 pass / 0 fail** |
| Playwright editorial brief deep-link (local) | See delivery section after CI/local run |
| Full staging write spine | **NOT_EXECUTED** — no staging write enablement in this PR |

---

## 5. Mobile / console / metadata

| Check | Status |
|-------|--------|
| Editorial e2e widths 320–1440 | Covered by existing `editorial-landing.spec.ts` |
| Canonical / SEO | Existing `site/e2e/seo.spec.ts` — not re-run as PASS claim here unless executed |
| Unauth data exposure | Investigations **401**; health reveals config flags only (no PHI) |
| Console errors on production | Spot-check **NOT_EXECUTED** in headed browser this run |

---

## 6. Residual risk

- Researchers may still expect `/contact` to email someone — honesty copy mitigates; ops process remains human.
- Multi-scenario homepage still `illustrative` — do not treat as staging acceptance.
- Workspace features remain LIMITED/BLOCKED under production write park (see cross-domain acceptance).
