-- N7: research-safe experiment ledger (prediction freeze before outcome).
-- Apply only to red-wave HSI Neon. No PHI, no Gate C auto-approve, no graph publication grant.
-- Application validators in src/evidence/experimentLedger.ts remain authoritative for fail-closed rules.
BEGIN;

CREATE TABLE IF NOT EXISTS hsi_experiment_ledger_records (
  id text NOT NULL,
  version integer NOT NULL CHECK (version >= 1),
  parent_version integer CHECK (parent_version IS NULL OR (parent_version >= 1 AND parent_version < version)),
  lifecycle text NOT NULL CHECK (
    lifecycle IN (
      'prediction_draft',
      'prediction_frozen',
      'protocol_bound',
      'artifacts_attached',
      'outcome_recorded',
      'review_candidate',
      'withdrawn'
    )
  ),
  data_basis text NOT NULL CHECK (
    data_basis IN ('fixture_engineering', 'authorised_public_data', 'partner_lab_agreement')
  ),
  fixture_honesty boolean NOT NULL,
  programme text NOT NULL CHECK (programme = 'gut_immune_t2d'),
  prediction jsonb NOT NULL,
  protocol jsonb,
  raw_artifacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  processing jsonb,
  qc jsonb,
  outcome jsonb,
  review_candidate jsonb,
  frozen_eval_pins jsonb NOT NULL,
  scientific_approval boolean NOT NULL DEFAULT false CHECK (scientific_approval = false),
  graph_promotable boolean NOT NULL DEFAULT false CHECK (graph_promotable = false),
  real_observation_claimed boolean NOT NULL DEFAULT false CHECK (real_observation_claimed = false),
  content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL,
  archived_at timestamptz,
  PRIMARY KEY (id, version),
  CHECK (
    (data_basis = 'fixture_engineering' AND fixture_honesty = true)
    OR (data_basis <> 'fixture_engineering' AND fixture_honesty = false)
  ),
  CHECK (
    (outcome IS NULL)
    OR (prediction ? 'freeze' AND prediction->'freeze' IS NOT NULL AND prediction->'freeze' <> 'null'::jsonb)
  )
);

CREATE INDEX IF NOT EXISTS hsi_experiment_ledger_lifecycle_idx
  ON hsi_experiment_ledger_records (lifecycle, data_basis);

CREATE INDEX IF NOT EXISTS hsi_experiment_ledger_live_idx
  ON hsi_experiment_ledger_records (id)
  WHERE archived_at IS NULL AND lifecycle <> 'withdrawn';

COMMENT ON TABLE hsi_experiment_ledger_records IS
  'N7 experiment ledger. Prediction content hash must freeze before outcome. Rows are not scientific approvals or graph facts. Fixture ≠ real observation.';

COMMIT;
