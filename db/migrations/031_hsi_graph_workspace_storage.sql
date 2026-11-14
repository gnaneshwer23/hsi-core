-- 031 DRAFT ONLY. HELD. DO NOT APPLY without HSI security approval and least-privilege role review.
-- Storage for (1) pinned ontology releases and their terms, (2) saved graph investigations, and
-- (3) curator mapping recommendations. Nothing here stores patient data, approves a mapping, or writes the
-- scientific graph. Public reference data and owner-scoped, append-only records only.
--
-- Access: the tables have NO policies and NO runtime grants. Ordinary reads and writes are denied. The runtime reaches
-- them only through the SECURITY DEFINER procedures in held migration 032, which validate the caller's session token
-- inside the same transaction. No session or owner GUC is trusted (an earlier draft of this file used one; a forged
-- GUC exposed another owner's row in the P0-C audit, so it was removed).
--
-- ROLLBACK (take a backup first; this drops data):
--   DROP TABLE IF EXISTS public.hsi_ontology_mapping_recommendations, public.hsi_graph_investigations,
--     public.hsi_ontology_terms, public.hsi_ontology_releases CASCADE;
--   DROP FUNCTION IF EXISTS public.hsi_graph_block_mutation(), public.hsi_graph_investigation_chain(),
--     public.hsi_mapping_recommendation_chain();

-- 1. Ontology releases: one row per pinned, hash-verified release. Written only by the import role, never by users.
CREATE TABLE IF NOT EXISTS public.hsi_ontology_releases(
 prefix text NOT NULL CHECK(prefix IN ('MONDO','UBERON','CL','GO','ECO')),
 release text NOT NULL CHECK(length(release) BETWEEN 1 AND 80),
 name text NOT NULL,
 licence text NOT NULL CHECK(length(trim(licence))>0),
 source_url text NOT NULL CHECK(source_url ~ '^https://' AND source_url !~ '/(latest|current)/'),
 sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 byte_size bigint NOT NULL CHECK(byte_size>0),
 term_count integer NOT NULL CHECK(term_count>0),
 data_version text,
 approved_on date NOT NULL,
 approved_by text NOT NULL CHECK(length(trim(approved_by))>0),
 imported_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(prefix,release)
);

-- 2. Ontology terms: identifier, label, exact synonyms, same-ontology parents, obsolete flag. Nothing else is kept.
CREATE TABLE IF NOT EXISTS public.hsi_ontology_terms(
 prefix text NOT NULL,
 release text NOT NULL,
 term_id text NOT NULL,
 label text NOT NULL,
 synonyms text[] NOT NULL DEFAULT '{}',
 parents text[] NOT NULL DEFAULT '{}',
 obsolete boolean NOT NULL DEFAULT false,
 PRIMARY KEY(prefix,release,term_id),
 FOREIGN KEY(prefix,release) REFERENCES public.hsi_ontology_releases(prefix,release),
 CHECK(term_id ~ '^[A-Za-z]+:[0-9]+$' AND split_part(term_id,':',1)=prefix),
 CHECK(label<>'' OR obsolete)
);
CREATE INDEX IF NOT EXISTS hsi_ontology_terms_label ON public.hsi_ontology_terms(prefix,release,lower(label));

-- Shared guard: append-only tables never change after insert.
CREATE OR REPLACE FUNCTION public.hsi_graph_block_mutation() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
 RAISE EXCEPTION '% is append-only; % is not permitted',TG_TABLE_NAME,TG_OP USING ERRCODE='42501';
END $f$;

-- 3. Saved graph investigations: append-only revisions chained by digest. The application recomputes digests and
-- reproducibility on read; the database enforces the structure it can (chain, scope, non-approval flags).
CREATE TABLE IF NOT EXISTS public.hsi_graph_investigations(
 owner_id text NOT NULL CHECK(length(trim(owner_id))>0),
 investigation_id text NOT NULL CHECK(investigation_id ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,80}$'),
 revision integer NOT NULL CHECK(revision>=1),
 graph_version text NOT NULL CHECK(graph_version ~ '^[a-f0-9]{64}$'),
 digest text NOT NULL CHECK(digest ~ '^[a-f0-9]{64}$'),
 previous_digest text CHECK(previous_digest IS NULL OR previous_digest ~ '^[a-f0-9]{64}$'),
 record jsonb NOT NULL,
 review_status text NOT NULL DEFAULT 'unreviewed' CHECK(review_status='unreviewed'),
 saved_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(owner_id,investigation_id,revision),
 UNIQUE(owner_id,investigation_id,digest),
 CHECK((revision=1)=(previous_digest IS NULL)),
 -- A CHECK passes when its expression is NULL, so each test is wrapped in COALESCE(...,false): a missing key or a
 -- jsonb scalar (for example a double-encoded string) must fail, not slip through.
 CHECK(jsonb_typeof(record)='object'),
 CHECK(COALESCE(record->>'schemaVersion'='hsi-graph-investigation-1',false)),
 CHECK(COALESCE(record->>'graphVersion'=graph_version AND record->'context'->>'graphVersion'=graph_version,false)),
 CHECK(COALESCE(record->'context'->>'investigationId'=investigation_id,false)),
 CHECK(COALESCE(record->>'scientificApproval'='false',false)),
 CHECK(COALESCE(record->'checks'->>'candidateOnly'='true' AND record->'checks'->>'scopedToSnapshot'='true',false)),
 CHECK(pg_column_size(record)<=1048576)
);
CREATE OR REPLACE FUNCTION public.hsi_graph_investigation_chain() RETURNS trigger LANGUAGE plpgsql AS $f$
DECLARE prev record;
BEGIN
 IF NEW.revision>1 THEN
  SELECT digest INTO prev FROM public.hsi_graph_investigations
   WHERE owner_id=NEW.owner_id AND investigation_id=NEW.investigation_id AND revision=NEW.revision-1;
  IF NOT FOUND OR prev.digest IS DISTINCT FROM NEW.previous_digest THEN
   RAISE EXCEPTION 'revision % does not extend the stored chain',NEW.revision USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $f$;
DROP TRIGGER IF EXISTS hsi_graph_investigations_chain ON public.hsi_graph_investigations;
CREATE TRIGGER hsi_graph_investigations_chain BEFORE INSERT ON public.hsi_graph_investigations FOR EACH ROW EXECUTE FUNCTION public.hsi_graph_investigation_chain();
DROP TRIGGER IF EXISTS hsi_graph_investigations_append_only ON public.hsi_graph_investigations;
CREATE TRIGGER hsi_graph_investigations_append_only BEFORE UPDATE OR DELETE ON public.hsi_graph_investigations FOR EACH ROW EXECUTE FUNCTION public.hsi_graph_block_mutation();
DROP TRIGGER IF EXISTS hsi_graph_investigations_no_truncate ON public.hsi_graph_investigations;
CREATE TRIGGER hsi_graph_investigations_no_truncate BEFORE TRUNCATE ON public.hsi_graph_investigations FOR EACH STATEMENT EXECUTE FUNCTION public.hsi_graph_block_mutation();
CREATE INDEX IF NOT EXISTS hsi_graph_investigations_owner_saved ON public.hsi_graph_investigations(owner_id,saved_at DESC);

-- 4. Curator mapping recommendations: append-only. A recommendation is NOT an approved mapping and this table has no
-- approval column on purpose: approval needs a separately designed, independently reviewed workflow.
CREATE TABLE IF NOT EXISTS public.hsi_ontology_mapping_recommendations(
 owner_id text NOT NULL CHECK(length(trim(owner_id))>0),
 concept_id text NOT NULL CHECK(concept_id LIKE 'concept:%' AND length(concept_id)<=200),
 revision integer NOT NULL CHECK(revision>=1),
 decision text NOT NULL CHECK(decision IN ('accept_candidate','reject_candidate','defer')),
 ontology_prefix text,
 ontology_release text,
 ontology_term_id text,
 reason text NOT NULL CHECK(length(trim(reason)) BETWEEN 10 AND 500),
 reviewer_label text NOT NULL CHECK(reviewer_label ~ '^[[:alnum:] .''_-]{2,60}$'),
 reviewer_principal_id text,
 reviewer_verified boolean NOT NULL DEFAULT false,
 candidates_digest text NOT NULL CHECK(candidates_digest ~ '^[a-f0-9]{64}$'),
 digest text NOT NULL CHECK(digest ~ '^[a-f0-9]{64}$'),
 previous_digest text CHECK(previous_digest IS NULL OR previous_digest ~ '^[a-f0-9]{64}$'),
 decided_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(owner_id,concept_id,revision),
 UNIQUE(owner_id,concept_id,digest),
 FOREIGN KEY(ontology_prefix,ontology_release,ontology_term_id) REFERENCES public.hsi_ontology_terms(prefix,release,term_id),
 CHECK((revision=1)=(previous_digest IS NULL)),
 CHECK((decision='defer')=(ontology_term_id IS NULL)),
 CHECK((ontology_term_id IS NULL)=(ontology_prefix IS NULL AND ontology_release IS NULL)),
 CHECK(reviewer_verified=(reviewer_principal_id IS NOT NULL))
);
CREATE OR REPLACE FUNCTION public.hsi_mapping_recommendation_chain() RETURNS trigger LANGUAGE plpgsql AS $f$
DECLARE prev record;
BEGIN
 IF NEW.revision>1 THEN
  SELECT digest INTO prev FROM public.hsi_ontology_mapping_recommendations
   WHERE owner_id=NEW.owner_id AND concept_id=NEW.concept_id AND revision=NEW.revision-1;
  IF NOT FOUND OR prev.digest IS DISTINCT FROM NEW.previous_digest THEN
   RAISE EXCEPTION 'revision % does not extend the stored chain',NEW.revision USING ERRCODE='23514';
  END IF;
 END IF;
 -- A recommendation may only name a live (non-obsolete) term.
 IF NEW.ontology_term_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.hsi_ontology_terms t WHERE t.prefix=NEW.ontology_prefix AND t.release=NEW.ontology_release AND t.term_id=NEW.ontology_term_id AND t.obsolete) THEN
  RAISE EXCEPTION 'term % is obsolete',NEW.ontology_term_id USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $f$;
DROP TRIGGER IF EXISTS hsi_mapping_recommendations_chain ON public.hsi_ontology_mapping_recommendations;
CREATE TRIGGER hsi_mapping_recommendations_chain BEFORE INSERT ON public.hsi_ontology_mapping_recommendations FOR EACH ROW EXECUTE FUNCTION public.hsi_mapping_recommendation_chain();
DROP TRIGGER IF EXISTS hsi_mapping_recommendations_append_only ON public.hsi_ontology_mapping_recommendations;
CREATE TRIGGER hsi_mapping_recommendations_append_only BEFORE UPDATE OR DELETE ON public.hsi_ontology_mapping_recommendations FOR EACH ROW EXECUTE FUNCTION public.hsi_graph_block_mutation();
DROP TRIGGER IF EXISTS hsi_mapping_recommendations_no_truncate ON public.hsi_ontology_mapping_recommendations;
CREATE TRIGGER hsi_mapping_recommendations_no_truncate BEFORE TRUNCATE ON public.hsi_ontology_mapping_recommendations FOR EACH STATEMENT EXECUTE FUNCTION public.hsi_graph_block_mutation();

-- Ontology reference tables are also immutable once a release is recorded.
DROP TRIGGER IF EXISTS hsi_ontology_releases_append_only ON public.hsi_ontology_releases;
CREATE TRIGGER hsi_ontology_releases_append_only BEFORE UPDATE OR DELETE ON public.hsi_ontology_releases FOR EACH ROW EXECUTE FUNCTION public.hsi_graph_block_mutation();
DROP TRIGGER IF EXISTS hsi_ontology_terms_append_only ON public.hsi_ontology_terms;
CREATE TRIGGER hsi_ontology_terms_append_only BEFORE UPDATE OR DELETE ON public.hsi_ontology_terms FOR EACH ROW EXECUTE FUNCTION public.hsi_graph_block_mutation();

-- Defence in depth: deny by default. No PUBLIC access; no UPDATE/DELETE/TRUNCATE for anyone but the table owner.
ALTER TABLE public.hsi_ontology_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_ontology_releases FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_ontology_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_ontology_terms FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_graph_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_graph_investigations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_ontology_mapping_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_ontology_mapping_recommendations FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.hsi_ontology_releases,public.hsi_ontology_terms,public.hsi_graph_investigations,public.hsi_ontology_mapping_recommendations FROM PUBLIC;
-- No policies: deny by default. See 032 for the only access path.
