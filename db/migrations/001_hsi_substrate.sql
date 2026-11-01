-- HSI Stage 1 substrate stub (owned by hsi-core).
-- Target: Neon project red-wave-06625195 / neondb only.
-- Not a copy of immunecity / ISI schema. No PHI. No auto-approve.

-- Migration ledger
CREATE TABLE IF NOT EXISTS hsi_schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Claims (assertion layer)
CREATE TABLE IF NOT EXISTS hsi_claims (
  id text PRIMARY KEY,
  assertion text NOT NULL,
  domain text NOT NULL,
  isi_relationship_id text,
  aksh_node_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Markers (LOINC-friendly; no patient values here)
CREATE TABLE IF NOT EXISTS hsi_markers (
  id text PRIMARY KEY,
  name text NOT NULL,
  loinc text,
  unit text,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Graded directed edges + embedded provenance stub
CREATE TABLE IF NOT EXISTS hsi_edges (
  id text PRIMARY KEY,
  edge_type text NOT NULL,
  subject_id text NOT NULL,
  subject_label text NOT NULL,
  object_id text NOT NULL,
  object_label text NOT NULL,
  claim_id text NOT NULL REFERENCES hsi_claims (id),
  curation_review text NOT NULL,
  hsi_grade text NOT NULL,
  teaching_status text NOT NULL,
  domain text NOT NULL,
  pmid text,
  doi text,
  citation_label text,
  source_url text,
  provenance_notes text,
  provenance_recorded_at timestamptz,
  bridge_candidate boolean NOT NULL DEFAULT false,
  seed_kind text NOT NULL DEFAULT 'placeholder',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hsi_edges_grade_check CHECK (
    hsi_grade IN ('established', 'uncertain', 'unexplored')
  ),
  CONSTRAINT hsi_edges_seed_kind_check CHECK (
    seed_kind IN ('placeholder', 'mapped')
  )
);

CREATE INDEX IF NOT EXISTS hsi_edges_claim_idx ON hsi_edges (claim_id);
CREATE INDEX IF NOT EXISTS hsi_edges_grade_idx ON hsi_edges (hsi_grade);
CREATE INDEX IF NOT EXISTS hsi_edges_pmid_idx ON hsi_edges (pmid);

-- Gate C review queue on HSI Neon — human-only placeholders.
-- Never auto-approve. ISI product approve+supports stays in autumn-snow
-- (separate technology / DB); this table tracks HSI-side curator work only.
CREATE TABLE IF NOT EXISTS hsi_gate_c_reviews (
  id bigserial PRIMARY KEY,
  edge_id text NOT NULL REFERENCES hsi_edges (id),
  claim_id text NOT NULL REFERENCES hsi_claims (id),
  isi_relationship_id text,
  pmid text,
  doi text,
  spo_note text,
  status text NOT NULL DEFAULT 'pending',
  reviewer_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  auto_approve boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hsi_gate_c_auto_approve_false CHECK (auto_approve = false),
  CONSTRAINT hsi_gate_c_status_check CHECK (
    status IN (
      'pending',
      'in_review',
      'human_approved',
      'human_rejected',
      'deferred'
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS hsi_gate_c_reviews_edge_uidx
  ON hsi_gate_c_reviews (edge_id);

CREATE INDEX IF NOT EXISTS hsi_gate_c_reviews_status_idx
  ON hsi_gate_c_reviews (status);
