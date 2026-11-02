# HSI Tool and API Contracts (§5 Layer 4 + LHK-G D8 + Four-Product X-*)

**Document status:** Typed tool / API sketches for the Intelligence Engine  
**Rule:** Agents and products call **typed tools**, never unrestricted DB access. LLM narrates tool results — does not invent edges or citations.  
**Status:** **Verified** · **Partial** · **Proposed** · **Missing**

Aligns with [`HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) Deliverable 8 and [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) exchanges X-A–X-H.

---

## 1. Design principles

| Principle | Requirement |
|-----------|-------------|
| Typed I/O | JSON Schema / OpenAPI; reject unknown fields |
| Authz first | Role + purpose + plane on every call |
| Query limits | Depth, row, token, rate caps |
| Audit | Tool name, args hash, source ids, latency, error class |
| No raw SQL/Neo4j from agents | Only service APIs |
| Honesty | `forceStub` / synthetic flags must propagate |

---

## 2. Tool families

### 2.1 Graph tools (LHK-G)

| Tool | Status | Home | Notes |
|------|--------|------|-------|
| `resolveEntity` | **Partial** (ISI name/id search) | ISI | Extend externalIds |
| `lookupEntity` | **Verified** Atlas/engine | ISI | |
| `traverseNeighbourhood` | **Verified** | ISI engine | Cap depth |
| `retrieveEvidence` | **Partial** | ISI Neon + hsi packs | Review-status filter |
| `compareRelationships` | **Proposed** | ISI | Contradictions |
| `exploreMechanism` | **Partial** via Ask/paths | ISI | Cap 8 |
| `temporalQuery` | **Missing** product | HSI Clinical | Workflow A |
| `retrieveTrials` | **Partial** / flag-off | Trials/ISI | Cap 16 |
| `registerHypothesis` | **Proposed** | ISI | Cap 15 |
| `inspectProvenance` | **Partial** | hsi-core grades / Gate C | |

### 2.2 Evidence tools

| Tool | Status | Map |
|------|--------|-----|
| `fetchPublicationMetadata` | **Verified** Cite Check path | PubMed/Crossref |
| `gradeEdgeLookup` | **Verified** | hsi-core packs |
| `gateCCandidateList` | **Partial** | ISI queue |
| `isiEvidenceConsume` (X-G1) | **Verified** / Partial ops | Pin JSON |

### 2.3 Terminology tools

| Tool | Status | Map |
|------|--------|-----|
| `normalizeCode` | **Partial** | DrASSIST lexicon; LOINC claim links (8) |
| `crosswalkSystems` | **Proposed** | Shared terminology service |

### 2.4 Clinical tools

| Tool | Status | Map |
|------|--------|-----|
| `getPatientContext` | **Partial** synthetic | Aksh patient view |
| `stageFhirBundle` | **Verified** staging | BRIDGE `liveEmis:false` |
| `medicationSafetyCheck` | **Verified** sim | GUARDIAN |
| `exportPatientObservations` (X-A1) | **Proposed** | Aksh → Clinical |

### 2.5 Trials tools

| Tool | Status | Map |
|------|--------|-----|
| `searchRegistries` | **Proposed** | CT.gov / ICTRP |
| `extractEligibility` | **Mocked** | ATLAS scaffold |
| `matchCriteria` | **Missing** | Five-state engine |
| `verifyTrialFreshness` | **Proposed** | Cap 20 |

### 2.6 Analytics tools

| Tool | Status | Map |
|------|--------|-----|
| `labTrendSummary` | **Partial** | Diabetes/metabolic |
| `coverageGapReport` | **Proposed** | Cap 14 |

---

## 3. YAML sketches (illustrative)

### Graph — `traverseNeighbourhood`

```yaml
tool: traverseNeighbourhood
version: proposed-v1
authz: { planes: [P0, P1], roles: [researcher, curator, public_browse] }
input:
  entityId: string
  depth: { type: integer, maximum: 3 }
  relationFilters: string[]
  includeDraft: boolean
output:
  nodes: EntityCard[]
  edges: EdgeCard[]  # must include claimType, reviewStatus
  truncated: boolean
errors: [NOT_FOUND, DEPTH_CAP, UNAUTHORIZED]
```

### Evidence — `fetchPublicationMetadata`

```yaml
tool: fetchPublicationMetadata
version: partial-v1  # Cite Check exists
authz: { planes: [P0, P1], roles: [curator, researcher] }
input:
  identifiers: [{ system: PMID|DOI, value: string }]
output:
  results: [{ id, status: verified|not_found|unavailable, title?, retrievedAt }]
restrictions:
  - never_implies_claim_support
```

### Clinical — `getPatientContext` (synthetic)

```yaml
tool: getPatientContext
version: simulation-v1
authz: { planes: [P2], roles: [clinician], syntheticOnly: true }
input:
  patientId: string
  purpose: enum[care, screening_prep, audit]
output:
  contextPackage: object
  honesty: { syntheticOnly: true, realPatientData: false }
errors: [UNAUTHORIZED, NOT_SYNTHETIC_ALLOWED]
```

### Trials — `matchCriteria`

```yaml
tool: matchCriteria
version: proposed-v1
authz: { planes: [P2, P3], roles: [trial_coordinator, referring_clinician] }
input:
  criteria: StructuredCriterion[]
  patientAttributes: AttributeBag[]  # min necessary
output:
  evaluations:
    - criterionId: string
      state: satisfied|not_satisfied|unknown|ambiguous|requires_investigator_review
      explanation: string
      evidenceRefs: string[]
restrictions:
  - never_emit_confirmed_eligible
```

---

## 4. OpenAPI-style product exchanges (sketch)

```yaml
openapi: 3.0.3
info:
  title: HSI Cross-Product Intelligence APIs
  version: proposed-0.1
paths:
  /x/g1/evidence/consume:
    get:
      summary: X-G1 HsiEvidenceConsume
      description: Verified pin/sync path hsi-core → ISI
      responses:
        "200":
          description: Graded pack manifest + honesty flags
  /x/b1/mechanisms/lookup:
    post:
      summary: X-B1 BiomedicalMechanismLookup
      description: Concepts only — no patient identifiers
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [diseaseConcepts]
              properties:
                diseaseConcepts: { type: array, items: { type: string } }
      responses:
        "200":
          description: Mechanisms + cites + uncertainty
  /x/d1/trials/screen:
    post:
      summary: X-D1 TrialScreeningEvaluate
      responses:
        "200":
          description: Five-state screening report
  /x/h2/clinical-spine/gateway:
    post:
      summary: X-H2 ClinicalSpineGateway (Phase 5+)
      description: Validated HITL outputs from Aksh — Proposed
```

| Exchange | Status |
|----------|--------|
| X-G1 | **Exists** |
| X-G2 Gate C apply | **Partial** |
| X-H1 catalog | **Exists** (not runtime) |
| X-A/B/C/D/E/F/H2 | **Proposed** |

---

## 5. Forbidden interfaces

- Agent → Neon connection string / arbitrary SQL  
- Agent → write live EHR / EMIS  
- Research tool accepting raw PHI identifiers  
- “Eligibility: confirmed” response field  
- Silent graph mutation without Gate C / curator role  

---

## 6. Phase binding

**Phase 1 (intelligence roadmap):** freeze schemas for graph + evidence tools used by Workflow B.  
**Later:** clinical temporal + trials matchCriteria.  
No implementation in this pack.
