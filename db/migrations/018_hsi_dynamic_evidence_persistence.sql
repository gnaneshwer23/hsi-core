-- PR 3: persist dynamic retrieval search records + identity links (red-wave HSI only).
-- Extends 002 source rows; does NOT approve claims, import passages, or promote graph.
-- Application validators in src/evidence/dynamicEvidencePersistence.ts remain authoritative.
BEGIN;

CREATE TABLE IF NOT EXISTS hsi_dynamic_search_records (
  id text PRIMARY KEY,
  search_record_hash text NOT NULL UNIQUE CHECK (search_record_hash ~ '^[a-f0-9]{64}$'),
  question text NOT NULL CHECK (length(trim(question)) > 0),
  method text NOT NULL,
  overall_outcome text NOT NULL,
  record jsonb NOT NULL,
  claim_support text NOT NULL DEFAULT 'not_assessed' CHECK (claim_support = 'not_assessed'),
  content_access text NOT NULL DEFAULT 'metadata' CHECK (content_access = 'metadata'),
  scientific_approval boolean NOT NULL DEFAULT false CHECK (scientific_approval = false),
  graph_promotable boolean NOT NULL DEFAULT false CHECK (graph_promotable = false),
  gate_c_auto_approve boolean NOT NULL DEFAULT false CHECK (gate_c_auto_approve = false),
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hsi_dynamic_search_records_completed_idx
  ON hsi_dynamic_search_records (completed_at DESC);

CREATE TABLE IF NOT EXISTS hsi_evidence_identity_links (
  id text PRIMARY KEY,
  search_record_id text NOT NULL REFERENCES hsi_dynamic_search_records(id),
  from_identity text NOT NULL,
  to_identity text NOT NULL,
  from_layer text NOT NULL CHECK (from_layer IN ('record', 'study', 'independent_evidence')),
  to_layer text NOT NULL CHECK (to_layer IN ('record', 'study', 'independent_evidence')),
  relation text NOT NULL CHECK (relation IN (
    'same_provider_record',
    'cross_provider_same_record',
    'same_study',
    'cites_or_reviews',
    'derived_not_independent'
  )),
  counts_as_independent_evidence boolean NOT NULL,
  rationale text NOT NULL CHECK (length(trim(rationale)) > 0),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (search_record_id, from_identity, to_identity, relation)
);

CREATE INDEX IF NOT EXISTS hsi_evidence_identity_links_search_idx
  ON hsi_evidence_identity_links (search_record_id);

CREATE TABLE IF NOT EXISTS hsi_dynamic_candidate_bindings (
  id text PRIMARY KEY,
  search_record_id text NOT NULL REFERENCES hsi_dynamic_search_records(id),
  source_id text NOT NULL REFERENCES hsi_evidence_sources(id),
  role text NOT NULL CHECK (role IN (
    'bibliographic_candidate',
    'open_targets_candidate',
    'duplicate_retrieval'
  )),
  response_identity text NOT NULL DEFAULT '',
  pmid text,
  provider text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- response_identity distinguishes multiple duplicate_retrieval provenance rows
  UNIQUE (search_record_id, source_id, role, response_identity)
);

CREATE INDEX IF NOT EXISTS hsi_dynamic_candidate_bindings_source_idx
  ON hsi_dynamic_candidate_bindings (source_id);

COMMENT ON TABLE hsi_dynamic_search_records IS
  'PR 3 reproducible dynamic retrieval search records. Metadata-only; not claim support or Gate C.';
COMMENT ON TABLE hsi_evidence_identity_links IS
  'Links record/study/independence layers without discarding provenance. OT Europe PMC–derived lit ≠ independent corroboration.';
COMMENT ON TABLE hsi_dynamic_candidate_bindings IS
  'Binds draft candidate sources to a search record; duplicate_retrieval preserves dropped retrieval provenance.';

COMMIT;
