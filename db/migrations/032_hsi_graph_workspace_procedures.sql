-- 032 DRAFT ONLY. HELD. DO NOT APPLY without HSI security approval. Requires 006 and 031 and the Neon Auth schema.
-- The only access path to the 031 tables. Each procedure validates the caller's session token against
-- neon_auth.session INSIDE the same transaction, derives the principal from it, and scopes every row to that
-- principal. No session or owner GUC is trusted, and the runtime role gets EXECUTE on these functions only, never
-- table grants. The definer must be a dedicated, non-superuser function-owner role; do not deploy as a superuser,
-- because that would hide a missing policy (the checks in db/verify/032_* run as a non-superuser for this reason).
-- Do not log session tokens or include them in telemetry.
--
-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.hsi_graph_principal(text), public.hsi_graph_save_investigation(text,text,integer,text,text,text,jsonb),
--     public.hsi_graph_list_investigations(text), public.hsi_graph_get_investigation(text,text,integer),
--     public.hsi_graph_record_recommendation(text,text,integer,text,text,text,text,text,text,text,text,text,timestamptz),
--     public.hsi_graph_list_recommendations(text), public.hsi_graph_ontology_lookup(text,text,text,text,integer);
--   DROP POLICY IF EXISTS hsi_graph_definer_select ON public.<each 031 table>; DROP POLICY IF EXISTS hsi_graph_definer_insert ON public.<each>;

-- FORCE ROW LEVEL SECURITY (031) applies to the table owner too, so the function owner needs explicit policies.
-- They are created for whoever runs this migration, which is also the function owner (SECURITY DEFINER).
DO $p$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['hsi_ontology_releases','hsi_ontology_terms','hsi_graph_investigations','hsi_ontology_mapping_recommendations'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS hsi_graph_definer_select ON public.%I',t);
  EXECUTE format('CREATE POLICY hsi_graph_definer_select ON public.%I FOR SELECT TO %I USING (true)',t,current_user);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['hsi_graph_investigations','hsi_ontology_mapping_recommendations'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS hsi_graph_definer_insert ON public.%I',t);
  EXECUTE format('CREATE POLICY hsi_graph_definer_insert ON public.%I FOR INSERT TO %I WITH CHECK (true)',t,current_user);
 END LOOP;
END $p$;

CREATE OR REPLACE FUNCTION public.hsi_graph_principal(p_token text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, neon_auth AS $$
DECLARE v_principal text;
BEGIN
 IF p_token IS NULL OR length(p_token)<16 OR length(p_token)>4096 OR p_token ~ '[[:space:]]' THEN
  RAISE EXCEPTION 'Invalid authenticated session' USING ERRCODE='28000';
 END IF;
 SELECT u.id::text INTO v_principal
 FROM neon_auth.session s JOIN neon_auth."user" u ON u.id=s."userId"
 WHERE s.token=p_token AND s."expiresAt">now() AND s."impersonatedBy" IS NULL
  AND u."emailVerified"=true AND COALESCE(u.banned,false)=false LIMIT 1;
 IF v_principal IS NULL THEN RAISE EXCEPTION 'Invalid authenticated session' USING ERRCODE='28000'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.hsi_research_access a WHERE a.principal_id=v_principal
   AND a.access_role IN ('researcher','research_admin') AND a.revoked_at IS NULL AND a.granted_at<=now()) THEN
  RAISE EXCEPTION 'Researcher access denied' USING ERRCODE='42501';
 END IF;
 RETURN v_principal;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_graph_save_investigation(p_token text,p_investigation_id text,p_revision integer,p_graph_version text,p_digest text,p_previous_digest text,p_record jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_graph_principal(p_token);
BEGIN
 INSERT INTO public.hsi_graph_investigations(owner_id,investigation_id,revision,graph_version,digest,previous_digest,record)
 VALUES(v_principal,p_investigation_id,p_revision,p_graph_version,p_digest,p_previous_digest,p_record);
 RETURN p_revision;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_graph_list_investigations(p_token text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_graph_principal(p_token);
BEGIN
 RETURN COALESCE((SELECT jsonb_agg(x ORDER BY x->>'savedAt' DESC) FROM (
  SELECT DISTINCT ON (i.investigation_id) jsonb_build_object('investigationId',i.investigation_id,'latestRevision',i.revision,'savedAt',i.saved_at,
   'question',i.record->'context'->>'question','graphVersion',i.graph_version) AS x
  FROM public.hsi_graph_investigations i WHERE i.owner_id=v_principal ORDER BY i.investigation_id,i.revision DESC) q),'[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.hsi_graph_get_investigation(p_token text,p_investigation_id text,p_revision integer) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_graph_principal(p_token);
BEGIN
 RETURN (SELECT jsonb_build_object('investigationId',i.investigation_id,'revision',i.revision,'graphVersion',i.graph_version,'digest',i.digest,
   'previousDigest',i.previous_digest,'savedAt',i.saved_at,'record',i.record,'reviewStatus',i.review_status)
  FROM public.hsi_graph_investigations i WHERE i.owner_id=v_principal AND i.investigation_id=p_investigation_id AND i.revision=p_revision);
END $$;

-- reviewer_verified means the IDENTITY came from a validated session, not that the reviewer has review authority.
CREATE OR REPLACE FUNCTION public.hsi_graph_record_recommendation(p_token text,p_concept_id text,p_revision integer,p_decision text,p_prefix text,p_release text,p_term_id text,p_reason text,p_reviewer_label text,p_candidates_digest text,p_digest text,p_previous_digest text,p_decided_at timestamptz)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_graph_principal(p_token);
BEGIN
 -- The client composes and digests the decision, so it supplies the time; the server only bounds it (no backdating).
 IF p_decided_at IS NULL OR p_decided_at<now()-interval '10 minutes' OR p_decided_at>now()+interval '1 minute' THEN
  RAISE EXCEPTION 'Decision time is out of range' USING ERRCODE='22023';
 END IF;
 INSERT INTO public.hsi_ontology_mapping_recommendations(owner_id,decided_at,concept_id,revision,decision,ontology_prefix,ontology_release,ontology_term_id,reason,reviewer_label,reviewer_principal_id,reviewer_verified,candidates_digest,digest,previous_digest)
 VALUES(v_principal,p_decided_at,p_concept_id,p_revision,p_decision,p_prefix,p_release,p_term_id,p_reason,p_reviewer_label,v_principal,true,p_candidates_digest,p_digest,p_previous_digest);
 RETURN p_revision;
END $$;

CREATE OR REPLACE FUNCTION public.hsi_graph_list_recommendations(p_token text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_graph_principal(p_token);
BEGIN
 RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('conceptId',r.concept_id,'revision',r.revision,'decision',r.decision,'ontologyPrefix',r.ontology_prefix,
   'ontologyRelease',r.ontology_release,'ontologyTermId',r.ontology_term_id,'reason',r.reason,'reviewerLabel',r.reviewer_label,'reviewerVerified',r.reviewer_verified,
   'candidatesDigest',r.candidates_digest,'digest',r.digest,'previousDigest',r.previous_digest,'decidedAt',r.decided_at) ORDER BY r.concept_id,r.revision)
  FROM public.hsi_ontology_mapping_recommendations r WHERE r.owner_id=v_principal),'[]'::jsonb);
END $$;

-- Bounded exact lookup by label or exact synonym in one pinned release. Never returns more than 50 rows.
CREATE OR REPLACE FUNCTION public.hsi_graph_ontology_lookup(p_token text,p_prefix text,p_release text,p_label text,p_limit integer DEFAULT 25) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_principal text:=public.hsi_graph_principal(p_token);
BEGIN
 IF p_label IS NULL OR length(trim(p_label)) NOT BETWEEN 3 AND 200 THEN RAISE EXCEPTION 'Label must be 3 to 200 characters' USING ERRCODE='22023'; END IF;
 RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('id',t.term_id,'label',t.label,'obsolete',t.obsolete,'parents',t.parents))
  FROM (SELECT * FROM public.hsi_ontology_terms t WHERE t.prefix=p_prefix AND t.release=p_release
   AND (lower(t.label)=lower(trim(p_label)) OR EXISTS(SELECT 1 FROM unnest(t.synonyms) s WHERE lower(s)=lower(trim(p_label))))
   ORDER BY t.term_id LIMIT LEAST(GREATEST(COALESCE(p_limit,25),1),50)) t),'[]'::jsonb);
END $$;

REVOKE ALL ON FUNCTION public.hsi_graph_principal(text),
 public.hsi_graph_save_investigation(text,text,integer,text,text,text,jsonb),
 public.hsi_graph_list_investigations(text),
 public.hsi_graph_get_investigation(text,text,integer),
 public.hsi_graph_record_recommendation(text,text,integer,text,text,text,text,text,text,text,text,text,timestamptz),
 public.hsi_graph_list_recommendations(text),
 public.hsi_graph_ontology_lookup(text,text,text,text,integer) FROM PUBLIC;

-- Activation is a separate, reviewed step: the runtime role gets EXECUTE on the six public procedures (not on
-- hsi_graph_principal) and nothing else. This block only applies when the role already exists.
DO $g$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='hsi_graph_runtime') THEN
  REVOKE ALL ON public.hsi_ontology_releases,public.hsi_ontology_terms,public.hsi_graph_investigations,public.hsi_ontology_mapping_recommendations FROM hsi_graph_runtime;
  GRANT EXECUTE ON FUNCTION public.hsi_graph_save_investigation(text,text,integer,text,text,text,jsonb),
   public.hsi_graph_list_investigations(text),public.hsi_graph_get_investigation(text,text,integer),
   public.hsi_graph_record_recommendation(text,text,integer,text,text,text,text,text,text,text,text,text,timestamptz),
   public.hsi_graph_list_recommendations(text),public.hsi_graph_ontology_lookup(text,text,text,text,integer) TO hsi_graph_runtime;
 END IF;
END $g$;
