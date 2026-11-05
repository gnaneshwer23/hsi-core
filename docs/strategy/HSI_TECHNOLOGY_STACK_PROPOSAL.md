# Human Super Intelligence — Technology Stack Proposal

**Recorded:** 5 November 2026. Founder-supplied technology/deployment proposal, retained for traceability.

**Interpretation:** This is an option catalogue and target-state proposal, not an instruction to provision every listed service or evidence that any provider, private deployment, clinical capability or compliance certification is live. The [MVP deployment profile](HSI_TECHNOLOGY_STACK_AND_DEPLOYMENT.md) records the selected existing foundation, acceptance checks and triggers for adding infrastructure. It takes precedence when interpreting implementation choices in this proposal.

**Boundary:** HSI, ISI and Aksh keep their product/data ownership. Identifiable clinical data and clinical engines remain outside `hsi-core`. Pseudonymised and genomic data are not automatically anonymous or permitted research inputs. Kubernetes, a graph database migration, a second authentication provider and a frontend rewrite are not authorised simply by appearing below.

---

# Original technology and deployment proposal

HSI should be deployed as a **modular, cloud-native platform** with separate environments for synthetic demos, public evidence, licensed research data, and patient-identifiable clinical data. The default model is a secure multi-tenant SaaS platform, with optional private-cloud or on-premise deployment for hospitals, labs, and pharma partners.

FHIR-based systems are commonly deployed as independently configurable server and client components, which suits HSI’s need to connect hospitals, labs, and research systems without hard-coupling them.  Neo4j also supports standalone or clustered Kubernetes deployment through Helm charts, making it suitable for a managed cloud-native HSI graph service. [hl7](https://hl7.org/fhir/uv/saner/Architecture_and_Implementation.html)

***

## 1. Recommended technology stack

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Web app | Next.js + React + TypeScript | Research workbench, graph explorer, dashboards |
| UI components | shadcn/ui, Radix UI, Tailwind CSS | Accessible, consistent design system |
| Graph visualisation | Cytoscape.js, React Flow, or D3.js | Immune, pathway, and mechanism maps |
| Charts | Recharts, Plotly, or ECharts | Lab trends, wearable signals, biomarker timelines |
| State/data fetching | TanStack Query + Zustand | API caching, workflow state, real-time updates |
| Mobile | Responsive web first; React Native later | Future patient or clinician mobile experience |

### Backend services

| Service | Technology | Responsibility |
|---|---|---|
| API gateway | Kong, AWS API Gateway, or NGINX | Authentication, routing, rate limits |
| Core API | Python FastAPI or Node.js/NestJS | Domain APIs, business logic |
| Ingestion service | Python + Celery/Temporal | EHR, lab, wearable, literature, and trial ingestion |
| Normalisation service | Python + Spark/DuckDB | Entity resolution, coding, validation |
| Graph service | Neo4j or PostgreSQL + Apache AGE | Knowledge-graph storage and queries |
| Vector service | pgvector or Qdrant | Semantic literature and evidence search |
| Agent orchestration | LangGraph or custom Python workflow engine | Bounded AI investigations |
| Verification service | Python FastAPI + evaluation models | Claim checking and citation validation |
| Trial service | Python + ClinicalTrials.gov adapter | Trial ingestion and matching |
| Notification service | SQS/SNS, Kafka, or RabbitMQ | Async jobs, alerts, webhooks |
| Audit service | Append-only event store | Security, provenance, and review audit |

### Data stores

| Store | Technology | What it holds |
|---|---|---|
| Operational database | PostgreSQL | Users, tenants, investigations, permissions, metadata |
| Graph database | Neo4j or PostgreSQL + Apache AGE | Cells, pathways, diseases, biomarkers, trials, evidence edges |
| Vector database | pgvector or Qdrant | Paper passages, evidence embeddings, semantic search |
| Document store | S3 / GCS / Azure Blob | PDFs, raw reports, exports, model artefacts |
| Time-series store | TimescaleDB or InfluxDB | Wearables, glucose, HRV, sleep, longitudinal signals |
| Data warehouse | Snowflake, BigQuery, or DuckDB | Research analytics and cohort analysis |
| Object/event log | Kafka or S3-based event store | Ingestion events, audit events, agent traces |
| Cache | Redis | Sessions, graph-query caching, rate limiting |

### AI layer

| Component | Technology | Purpose |
|---|---|---|
| Reasoning LLM | Frontier cloud model | Question planning, synthesis, hypothesis drafting |
| Extraction model | Smaller hosted or local model | Entity extraction, lab parsing, claim extraction |
| Embedding model | Domain biomedical embeddings | Semantic retrieval |
| Reranker | Cross-encoder model | Ranks evidence passages |
| Verifier | Deterministic rules + LLM verifier | Checks claims against sources |
| Agent framework | LangGraph or custom orchestrator | Controls workflow, retries, budgets, approvals |
| Evaluation harness | Python + MLflow/W&B | Citation validity, grounding, regression tests |

### Interoperability standards

| Standard | Use |
|---|---|
| **HL7 FHIR** | EHR, lab, medication, encounter, and patient-consented data exchange |
| **OMOP CDM** | Standardised longitudinal research data |
| **LOINC** | Laboratory test identification |
| **UCUM** | Units of measurement |
| **RxNorm** | Medication normalisation |
| **SNOMED CT** | Clinical concepts |
| **ICD-10 / MONDO** | Diseases |
| **HPO** | Phenotypes |
| **Cell Ontology / Uberon / GO / ChEBI** | Cells, tissues, processes, chemicals |
| **GA4GH** | Responsible genomic and health-data sharing |

FHIR and OMOP are complementary: FHIR supports health-data exchange, while OMOP standardises observational data for research; HL7 provides guidance for transforming FHIR data into OMOP.

***

## 2. Deployment architecture

```text
┌──────────────────────────────────────────────┐
│                   Users                       │
│ Researchers • Clinicians • Labs • Partners    │
└──────────────────────┬───────────────────────┘
                       │ HTTPS / OAuth 2.0
┌──────────────────────▼───────────────────────┐
│              Edge / API Gateway               │
│ WAF • AuthN/AuthZ • Rate limiting • Routing   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│              HSI Application Layer             │
│ Web app • APIs • Workbench • Admin console    │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│           HSI Intelligence Services           │
│ Planner • Retrieval • Graph • Verify • Trials │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│             HSI Data Platform                 │
│ PostgreSQL • Neo4j • Vector DB • S3 • OMOP    │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│           External / Partner Systems          │
│ EHR • Labs • Wearables • PubMed • Trials      │
└──────────────────────────────────────────────┘
```

***

## 3. Deployment environments

Use at least four isolated environments.

| Environment | Purpose | Data |
|---|---|---|
| **Local / development** | Engineering and testing | Synthetic data only |
| **Staging** | Integration and release testing | Synthetic + de-identified test data |
| **Demo / sandbox** | Customer demonstrations | Synthetic data only |
| **Production** | Live users | Public evidence; licensed/partner data; patient data only under approved governance |

### Environment isolation rules

- Separate cloud accounts, projects, or subscriptions.
- Separate databases, credentials, secrets, and encryption keys.
- Synthetic data can never enter the production evidence graph.
- Patient-identifiable data cannot enter public research stores.
- Production deployments require approved infrastructure-as-code changes.
- Every environment has separate logging, monitoring, and access controls.

***

## 4. Deployment models

### Model A: Multi-tenant SaaS — default

Best for researchers, labs, health apps, and smaller biotech teams.

```text
Shared HSI platform
├── Tenant A: Research lab
├── Tenant B: Biotech
├── Tenant C: Health app
└── Tenant D: Hospital pilot
```

**Advantages**

- Fast onboarding
- Lower cost
- Central improvements
- Easier evaluation and product iteration

**Controls**

- Tenant isolation
- Role-based access control
- Per-tenant encryption keys where required
- Data-residency options
- Audit logs per tenant
- Configurable data-retention policies

### Model B: Private cloud / VPC deployment

Best for hospitals, pharma, and regulated research partners.

```text
Customer cloud account / VPC
├── HSI control plane
├── Customer data plane
├── Private model endpoints
└── Customer-managed keys
```

**Advantages**

- Data residency
- Customer-controlled network boundaries
- Easier integration with internal EHR and lab systems
- Suitable for sensitive clinical or genomic data

### Model C: On-premise / hybrid deployment

Best for large hospitals, national health systems, or partners who cannot send identifiable data outside their infrastructure.

```text
Customer on-premise environment
├── FHIR / EHR integration
├── Local ingestion and de-identification
├── Local vector/graph store
├── Optional private LLM endpoint
└── HSI cloud intelligence layer
```

**Advantage**

- Identifiable data can remain inside the customer boundary.
- Only de-identified, authorised, or aggregate outputs connect to HSI cloud services.

### Model D: Embedded SDK / white label

Best for health apps, labs, and digital-health products.

```text
Partner product
└── HSI SDK / API
     ├── Lab insight module
     ├── Biomarker explanation module
     ├── Research brief module
     └── Trial-context module
```

This mirrors the modular approach used by health-AI platforms offering API-enabled, white-label modules.

***

## 5. Kubernetes deployment

Use Kubernetes for the core HSI services.

```text
Kubernetes cluster
├── hsi-web
├── hsi-api
├── hsi-ingestion
├── hsi-normalisation
├── hsi-graph-service
├── hsi-vector-service
├── hsi-agent-orchestrator
├── hsi-verifier
├── hsi-trial-service
├── hsi-audit-service
├── hsi-worker-pool
└── observability agents
```

### Recommended setup

- **Cloud:** AWS, GCP, or Azure
- **Cluster:** EKS, GKE, or AKS
- **Deployment:** Helm charts or Argo CD
- **Scaling:** Horizontal Pod Autoscaler
- **Database:** Managed PostgreSQL, managed Neo4j, or Neo4j on Kubernetes
- **Secrets:** AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, or HashiCorp Vault
- **Networking:** Private subnets, VPC endpoints, private database access
- **CI/CD:** GitHub Actions or GitLab CI
- **GitOps:** Argo CD or Flux

Neo4j provides Helm-based standalone and cluster deployment patterns for Kubernetes, including cloud options such as GKE, AWS, and AKS. [neo4j](https://neo4j.com/docs/operations-manual/current/kubernetes/)

***

## 6. Data-flow deployment

### Public evidence pipeline

```text
PubMed / Europe PMC
→ ingestion worker
→ PDF/text extraction
→ passage chunking
→ embedding model
→ vector database
→ evidence graph
→ retrieval API
```

### Clinical data pipeline

```text
Hospital EHR / lab system
→ FHIR API
→ HSI ingestion service
→ consent and authorisation check
→ de-identification or pseudonymisation
→ OMOP normalisation
→ patient-context graph
→ authorised research workspace
```

### Wearable pipeline

```text
Wearable API
→ ingestion worker
→ unit and timezone normalisation
→ quality checks
→ time-series database
→ longitudinal feature extraction
→ HSI reasoning layer
```

### AI investigation pipeline

```text
User question
→ API gateway
→ agent orchestrator
→ graph + vector + trial + evidence tools
→ claim verifier
→ policy gate
→ human review queue
→ versioned research brief
```

***

## 7. Security and compliance

### Core controls

| Control | Implementation |
|---|---|
| Identity | OAuth 2.0 / OIDC via Auth0, Cognito, or Keycloak |
| Authorisation | Role-based and attribute-based access control |
| Tenant isolation | Separate schemas, row-level security, and scoped API tokens |
| Encryption in transit | TLS 1.2+ everywhere |
| Encryption at rest | Database, object-store, and disk encryption |
| Secrets | Managed secret store; no secrets in code |
| Audit logging | Immutable append-only logs |
| Data minimisation | Collect only necessary fields |
| Pseudonymisation | Separate direct identifiers from research data |
| Backup | Encrypted, tested, regionally resilient backups |
| Incident response | Detection, containment, notification, and post-incident review |

HIPAA technical safeguards require controls for access, audit, integrity, authentication, and transmission security; encryption and decryption are addressable safeguards where reasonable and appropriate.  HHS guidance also emphasises access controls, encryption, audit controls, and authentication as core security measures. [hhs](https://www.hhs.gov/sites/default/files/ocr/privacy/hipaa/administrative/securityrule/techsafeguards.pdf)

### Data residency

Offer deployment regions such as:

- UK / EU
- US
- India
- Customer-selected private region

For genomic and health-related data, follow responsible-sharing principles covering transparency, accountability, privacy, security, and permitted use.

***

## 8. Observability and operations

| Area | Tooling |
|---|---|
| Logs | OpenTelemetry + Loki / CloudWatch / Cloud Logging |
| Metrics | Prometheus + Grafana |
| Tracing | OpenTelemetry + Jaeger / Tempo |
| Alerts | PagerDuty, Opsgenie, or Slack alerts |
| Error tracking | Sentry |
| Uptime | Health checks and synthetic monitoring |
| Cost monitoring | Cloud cost dashboards and per-tenant usage |
| AI monitoring | Token use, latency, model cost, failure rate, hallucination rate |

Track:

- API latency and error rate
- Graph-query performance
- Ingestion success rate
- Evidence-retrieval precision
- Citation-validity rate
- Agent task completion
- Human-review throughput
- Model cost per investigation
- Security events

***

## 9. CI/CD and release model

```text
Developer push
→ GitHub/GitLab
→ Automated tests
→ Schema migration check
→ Contract tests
→ Security scan
→ Build container image
→ Deploy to staging
→ Integration tests
→ Manual approval
→ Deploy to production
→ Observability and rollback plan
```

### Required tests

- Unit tests
- API contract tests
- Graph-schema migration tests
- Evidence-ingestion tests
- Retrieval-quality tests
- Claim-verification tests
- Agent workflow tests
- Security and permission tests
- Load tests
- Disaster-recovery tests

### Release strategy

- Semantic versioning
- Blue/green or canary deployments
- Database migrations with backward compatibility
- Feature flags
- Rollback plan for every release
- Model and prompt version pinning

***

## 10. Recommended MVP deployment

For the first HSI version, use a simple, low-cost but production-shaped stack:

```text
Vercel
└── Next.js frontend

AWS / GCP
├── FastAPI backend
├── PostgreSQL + pgvector
├── Neo4j Aura or self-hosted Neo4j
├── S3 / GCS for documents
├── Redis for cache and queues
├── Docker containers on ECS / Cloud Run / GKE
└── Managed LLM APIs

External data
├── Europe PMC
├── Reactome
├── ClinicalTrials.gov
└── Synthetic data generator
```

### MVP deployment principle

Start with:

- One cloud region
- One PostgreSQL database with separate schemas
- One Neo4j instance
- One vector index
- Synthetic-data sandbox
- Public evidence pipeline
- Basic RBAC
- Audit logging
- Automated backups
- Feature flags

Then evolve to multi-tenant SaaS, private-cloud deployments, and regulated clinical environments as customer requirements mature.

***

## 11. Deployment decision rule

Choose the deployment model based on data sensitivity:

| Data type | Recommended deployment |
|---|---|
| Public literature and trials | HSI multi-tenant SaaS |
| Synthetic demo data | HSI sandbox / demo environment |
| Licensed research data | HSI SaaS or customer VPC |
| De-identified research cohorts | HSI SaaS or private cloud |
| Identifiable clinical data | Customer VPC or on-premise |
| Genomic data | Customer-controlled environment or GA4GH-aligned governed deployment |
| Patient-facing data | Separate governed environment; never mixed with public research data |

***

## 12. Final deployment principle

> **HSI should deploy as modular, cloud-native intelligence services: public evidence can run in a scalable SaaS layer, while identifiable health and genomic data remain inside customer-controlled, governed environments.**

This gives HSI the speed of a modern SaaS platform, the flexibility to integrate labs and hospitals, and the governance required for real health data. [hl7](https://hl7.org/fhir/uv/saner/Architecture_and_Implementation.html)
