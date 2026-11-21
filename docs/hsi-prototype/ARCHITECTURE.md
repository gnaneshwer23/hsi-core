# HSI Prototype Architecture and Mermaid Diagrams

## System
```mermaid
flowchart TD
  U[Researchers / Labs / Clinicians / Students / Industry] --> AUTH[Verified onboarding + role dashboards]
  AUTH --> WB[Existing HSI Research Workbench]
  PUB[Public evidence / omics / trials APIs] --> ING[Rights-aware connectors + provenance]
  INST[Approved private or synthetic datasets] --> ING
  ING --> PRIV[Private versioned data context]
  WB --> ORCH[Durable scientific investigation orchestration]
  PRIV --> ORCH
  ORCH --> VER[Existing scientific verification engine]
  ORCH --> KG[Existing living knowledge graph]
  VER --> GAP[Contradictions / gaps / hypotheses]
  KG --> GAP
  GAP --> REPORT[Private evidence-linked research brief]
  REPORT --> CONSENT{Researcher approves sharing?}
  CONSENT -->|No| PRIVATE[Remain private]
  CONSENT -->|Yes| MATCH[Explainable collaborator matching]
  MATCH --> INVITE[Opt-in introduction / accept / decline]
  SEC[Server-verified identity + tenant isolation + audit] -.governs.-> AUTH
  SEC -.governs.-> PRIV
  SEC -.governs.-> MATCH
```

## Researcher journey
```mermaid
sequenceDiagram
  participant R as Researcher
  participant UI as HSI Workspace
  participant API as Verified API
  participant D as Data Connectors
  participant A as Scientific Agents
  participant V as Verification + Graph
  participant C as Collaboration
  R->>UI: Onboard / select role / create private project
  UI->>API: Authenticated project request
  API->>D: Validate authorised dataset and provenance
  D-->>API: Versioned normalised data context
  R->>UI: Submit scientific question
  UI->>API: Run investigation
  API->>A: Retrieve evidence + analyse context
  A->>V: Verify claims and graph relations
  V-->>UI: Evidence / uncertainties / gaps / hypotheses
  UI-->>R: Private research brief
  R->>UI: Preview shareable description
  UI->>C: Explicit approval + opt-in matching
  C-->>R: Explainable matches / invitations
```

## Permission state machine
```mermaid
stateDiagram-v2
  [*] --> Private
  Private --> Preview: Create minimal share preview
  Preview --> Private: Cancel
  Preview --> Approved: Explicit owner approval
  Approved --> Invited: Send invitation
  Invited --> Accepted: Recipient opts in
  Invited --> Declined: Recipient declines
  Approved --> Revoked: Owner revokes
  Invited --> Revoked: Owner revokes
  Accepted --> Revoked: Owner revokes future access
```

## Dataset integrity
Every dataset and derived claim has: source, licence, access scope, synthetic flag, schema version, provenance, transformation, QC and timestamp. Never merge unpaired source records into real patient identities. Every private-to-network transition requires explicit review and audit.
