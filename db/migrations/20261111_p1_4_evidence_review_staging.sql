-- P1.4 proposed Neon migration. Apply only after migration review.
-- DB roles must not expose direct table writes to browser/client identities.
CREATE TABLE IF NOT EXISTS hsi_research_evidence_snapshots (
  organization_id text NOT NULL,
  snapshot_id text NOT NULL,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  payload jsonb NOT NULL,
  submitted_by text NOT NULL,
  idempotency_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','accepted','rejected','needs_revision')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id,snapshot_id),
  UNIQUE (organization_id,idempotency_key)
);
CREATE TABLE IF NOT EXISTS hsi_research_evidence_review_events (
  event_id uuid PRIMARY KEY,
  organization_id text NOT NULL,
  snapshot_id text NOT NULL,
  reviewer_id text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('accepted','rejected','needs_revision')),
  notes text NOT NULL CHECK (length(trim(notes)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id,snapshot_id)
    REFERENCES hsi_research_evidence_snapshots(organization_id,snapshot_id),
  UNIQUE (organization_id,snapshot_id)
);
-- Defense in depth. Trusted server transactions must set scoped claims
-- with SET LOCAL and restrict access to the service role.
ALTER TABLE hsi_research_evidence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_research_evidence_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_research_evidence_review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_research_evidence_review_events FORCE ROW LEVEL SECURITY;
-- No permissive policies are installed: non-bypass roles are denied by default.
-- Do not run this migration as evidence that authenticated persistence works.
