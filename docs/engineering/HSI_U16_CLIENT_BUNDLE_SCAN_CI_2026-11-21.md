# U16 — Client-bundle secret scan in CI (21 November 2026)

**Phase:** Production readiness · public launch hygiene  
**Scope:** Run `bun run scan:client-bundle` after `site:build` in research-foundation verify.  
**Not claimed:** AppSec GO for PROD-QA-003; Gitleaks replacement.

## Change

- `.github/workflows/research-foundation.yml` — scan step after site build  
- Soft-land doc notes CI wiring without claiming acceptance  

## Acceptance

- Workflow YAML present and honest  
- Soft-land packet still `appSecAccepted: false`  
- Full-history Gitleaks remains a separate job  

## Follow-ons

- Owner AppSec assigns reviewer and closes PROD-QA-003  
