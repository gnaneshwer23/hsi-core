-- N2: versioned evidence ledger (assertion kinds + lineage). Additive; does NOT rewrite 002.
-- Apply only to red-wave HSI Neon. No PHI, no Gate C auto-approve, no graph publication grant.
-- Application validators in src/evidence/evidenceLedger.ts remain authoritative for fail-closed rules.
BEGIN;

CREATE TABLE IF NOT EXISTS hsi_evidence_ledger_records (
  id text NOT NULL,
  version integer NOT NULL CHECK (version >= 1),
  parent_version integer CHECK (parent_version IS NULL OR (parent_version >= 1 AND parent_version < version)),
  assertion_kind text NOT NULL CHECK (
    assertion_kind IN (
      'reported_finding',
      'prediction',
      'hypothesis',
      'experimental_observation'
    )
  ),
  assertion text NOT NULL CHECK (length(trim(assertion)) > 0),
  subject_id text NOT NULL,
  predicate text NOT NULL,
  object_id text NOT NULL,
  context jsonb NOT NULL,
  lineage jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'superseded', 'withdrawn')),
  prediction_freeze jsonb,
  observation_protocol jsonb,
  legacy_epistemic_type text CHECK (
    legacy_epistemic_type IS NULL OR legacy_epistemic_type IN (
      'experimental_finding',
      'observational_association',
      'review_summary',
      'computational_inference',
      'hypothesis'
    )
  ),
  scientific_approval boolean NOT NULL DEFAULT false CHECK (scientific_approval = false),
  graph_promotable boolean NOT NULL DEFAULT false CHECK (graph_promotable = false),
  claim_entailment_assessed boolean NOT NULL DEFAULT false CHECK (claim_entailment_assessed = false),
  content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL,
  archived_at timestamptz,
  PRIMARY KEY (id, version),
  CHECK (
    (assertion_kind = 'reported_finding' AND prediction_freeze IS NULL AND observation_protocol IS NULL)
    OR (assertion_kind = 'prediction' AND prediction_freeze IS NOT NULL AND observation_protocol IS NULL)
    OR (assertion_kind = 'hypothesis' AND prediction_freeze IS NULL AND observation_protocol IS NULL)
    OR (assertion_kind = 'experimental_observation' AND prediction_freeze IS NULL AND observation_protocol IS NOT NULL)
  ),
  CHECK (
    (status IN ('draft') AND archived_at IS NULL)
    OR (status IN ('superseded', 'withdrawn') AND archived_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS hsi_evidence_ledger_kind_idx
  ON hsi_evidence_ledger_records (assertion_kind, status);

CREATE INDEX IF NOT EXISTS hsi_evidence_ledger_live_idx
  ON hsi_evidence_ledger_records (id)
  WHERE status = 'draft';

-- Optional soft link from draft claims (002) without mutating archived claim rows.
ALTER TABLE hsi_evidence_claim_drafts
  ADD COLUMN IF NOT EXISTS ledger_record_id text,
  ADD COLUMN IF NOT EXISTS ledger_record_version integer;

COMMENT ON TABLE hsi_evidence_ledger_records IS
  'N2 versioned evidence ledger. Rows are not scientific approvals. Finding ≠ prediction ≠ hypothesis ≠ experimental_observation.';

COMMIT;
