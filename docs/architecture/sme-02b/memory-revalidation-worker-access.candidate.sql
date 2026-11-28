CREATE FUNCTION hsi_memory.read_revalidation_identity(p_job uuid,p_lease uuid)
RETURNS TABLE(pmid text,pmcid text,prior_quarantine boolean)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $access$
 SELECT i.pmid,i.pmcid,EXISTS(SELECT 1 FROM hsi_memory.adjudication_candidates h WHERE h.doi=a.doi AND h.source_version=a.source_version AND h.decision='quarantine')
 FROM hsi_memory.revalidation_jobs j
 JOIN hsi_memory.adjudication_candidates a ON a.decision_id=j.decision_id
 JOIN hsi_memory.revalidation_identity_candidates i ON i.decision_id=j.decision_id
 WHERE j.job_id=p_job AND j.lease_id=p_lease AND j.state='leased' AND j.lease_until>clock_timestamp()
$access$;
REVOKE ALL ON FUNCTION hsi_memory.read_revalidation_identity(uuid,uuid) FROM PUBLIC;
