-- Disposable candidate: unverified public-source assertions, never trusted observations.
CREATE TABLE hsi_memory.publication_assertion_candidates(
 assertion_id uuid PRIMARY KEY,
 doi text NOT NULL CHECK(length(doi) BETWEEN 8 AND 1024 AND doi ~ '^10\.[0-9]{4,9}/[^[:space:]]+$'),
 source_version text NOT NULL CHECK(length(btrim(source_version)) BETWEEN 1 AND 1000),
 authority text NOT NULL CHECK(authority IN ('crossref','publisher','pubmed','europe_pmc')),
 locator text NOT NULL CHECK(length(btrim(locator)) BETWEEN 1 AND 2048),
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 verification_state text NOT NULL DEFAULT 'unverified' CHECK(verification_state='unverified'),
 scientific_claim_allowed boolean NOT NULL DEFAULT false CHECK(NOT scientific_claim_allowed)
);
ALTER TABLE hsi_memory.publication_assertion_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.publication_assertion_candidates FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.publication_assertion_candidates FROM PUBLIC;
CREATE FUNCTION hsi_memory.stage_publication_assertion(p_id uuid,p_doi text,p_version text,p_authority text,p_locator text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $stage$
BEGIN
 -- Only synthetic fixture locators and DOI namespace are accepted at this stage.
 IF p_doi IS NULL OR p_doi !~ '^10[.]1234/fixture-[a-z0-9-]{1,80}$' OR p_locator IS NULL OR p_locator !~ '^fixture:[a-zA-Z0-9._-]{1,120}$' OR p_version IS NULL OR p_version !~ '^v[1-9][0-9]{0,8}$' THEN
 RAISE EXCEPTION 'Unapproved assertion input' USING ERRCODE='22023';
 END IF;
 INSERT INTO hsi_memory.publication_assertion_candidates(assertion_id,doi,source_version,authority,locator)
 VALUES(p_id,p_doi,p_version,p_authority,p_locator) ON CONFLICT DO NOTHING;
 IF NOT EXISTS(SELECT 1 FROM hsi_memory.publication_assertion_candidates a WHERE a.assertion_id=p_id AND a.doi=p_doi AND a.source_version=p_version AND a.authority=p_authority AND a.locator=p_locator) THEN
 RAISE EXCEPTION 'Assertion conflict' USING ERRCODE='40001'; END IF;
 RETURN p_id;
END $stage$;
REVOKE ALL ON FUNCTION hsi_memory.stage_publication_assertion(uuid,text,text,text,text) FROM PUBLIC;
