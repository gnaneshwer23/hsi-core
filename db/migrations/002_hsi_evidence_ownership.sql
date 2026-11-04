-- ARCH-002: additive HSI-owned evidence lineage schema, NOT a completed curation workflow.
-- Apply only to the dedicated HSI database after review. No PHI, no automated approval.
-- Do not grant direct public/agent write privileges to these tables.
BEGIN;

CREATE TABLE IF NOT EXISTS hsi_evidence_sources (
  id text PRIMARY KEY,
  source_kind text NOT NULL CHECK (source_kind IN ('publication','dataset','registry','ontology')),
  external_id text NOT NULL,
  title text NOT NULL,
  source_url text,
  doi text,
  pmid text,
  licence_status text NOT NULL DEFAULT 'unverified'
    CHECK (licence_status IN ('unverified','metadata_only','passage_permitted','restricted','prohibited')),
  retraction_status text NOT NULL DEFAULT 'unknown'
    CHECK (retraction_status IN ('unknown','none_reported','corrected','retracted')),
  retrieved_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_kind, external_id),
  CHECK (source_kind <> 'publication' OR pmid IS NOT NULL OR doi IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS hsi_evidence_passages (
  id text PRIMARY KEY,
  source_id text NOT NULL REFERENCES hsi_evidence_sources(id),
  source_locator text NOT NULL,
  passage_text text,
  passage_hash text NOT NULL,
  rights_verified_by text,
  rights_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (passage_text IS NULL OR (rights_verified_by IS NOT NULL AND rights_verified_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS hsi_evidence_claim_drafts (
  id text PRIMARY KEY,
  subject_id text NOT NULL,
  predicate text NOT NULL,
  object_id text NOT NULL,
  assertion text NOT NULL,
  biological_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  epistemic_type text NOT NULL CHECK (epistemic_type IN ('experimental_finding','observational_association','review_summary','computational_inference','hypothesis')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','qc_passed','under_review','approved','rejected','superseded','retracted')),
  origin text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(trim(assertion)) > 0)
);

CREATE TABLE IF NOT EXISTS hsi_evidence_claim_support (
  claim_id text NOT NULL REFERENCES hsi_evidence_claim_drafts(id),
  source_id text NOT NULL REFERENCES hsi_evidence_sources(id),
  passage_id text REFERENCES hsi_evidence_passages(id),
  polarity text NOT NULL CHECK (polarity IN ('supports','contradicts','contextualises')),
  assessment text NOT NULL DEFAULT 'unassessed'
    CHECK (assessment IN ('unassessed','weak','moderate','strong','inconclusive')),
  context_note text NOT NULL DEFAULT '',
  PRIMARY KEY (claim_id, source_id, polarity),
  -- A separate integrity trigger/service must verify passage_id belongs to source_id before deployment.
  CHECK (passage_id IS NULL OR length(passage_id) > 0)
);

CREATE TABLE IF NOT EXISTS hsi_evidence_review_decisions (
  id text PRIMARY KEY,
  claim_id text NOT NULL REFERENCES hsi_evidence_claim_drafts(id),
  decision text NOT NULL CHECK (decision IN ('approve','reject','defer','revoke')),
  reviewer_principal text NOT NULL,
  reviewer_role text NOT NULL,
  rationale text NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(trim(reviewer_principal)) > 0 AND length(trim(reviewer_role)) > 0 AND length(trim(rationale)) > 0)
);
-- Reviewer identity/role MUST be enforced by authenticated service and database permissions.
-- Rows alone are not proof of accountable approval.

CREATE TABLE IF NOT EXISTS hsi_evidence_graph_releases (
  id text PRIMARY KEY,
  release_version text NOT NULL UNIQUE,
  manifest_hash text NOT NULL,
  state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','published','revoked')),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CHECK (state <> 'published' OR published_at IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS hsi_evidence_release_claims (
  release_id text NOT NULL REFERENCES hsi_evidence_graph_releases(id),
  claim_id text NOT NULL REFERENCES hsi_evidence_claim_drafts(id),
  review_decision_id text NOT NULL REFERENCES hsi_evidence_review_decisions(id),
  PRIMARY KEY (release_id, claim_id)
);
-- Release promotion MUST additionally check claim status, decision=approve,
-- reviewer authorization, source rights, corrections and evidence sufficiency.

CREATE INDEX IF NOT EXISTS hsi_evidence_claim_support_source_idx ON hsi_evidence_claim_support(source_id);
CREATE INDEX IF NOT EXISTS hsi_evidence_review_claim_idx ON hsi_evidence_review_decisions(claim_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS hsi_evidence_release_claim_idx ON hsi_evidence_release_claims(claim_id);

COMMIT;
