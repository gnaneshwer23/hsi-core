-- Candidate registry populated only by a separately verified graph importer (not yet implemented).
CREATE TABLE hsi_memory.graph_nodes (
 graph_version text NOT NULL CHECK(graph_version ~ '^[a-f0-9]{64}$'),
 node_id text NOT NULL CHECK(node_id ~ '^[a-zA-Z0-9:._/-]{1,220}$'),
 PRIMARY KEY(graph_version,node_id)
);
CREATE TABLE hsi_memory.graph_links (
 tenant_id text NOT NULL, scope_id text NOT NULL, record_id uuid NOT NULL, version integer NOT NULL,
 graph_version text NOT NULL,node_id text NOT NULL,
 PRIMARY KEY(tenant_id,scope_id,record_id,version,graph_version,node_id),
 FOREIGN KEY(tenant_id,scope_id,record_id,version) REFERENCES hsi_memory.versions(tenant_id,scope_id,record_id,version) ON DELETE CASCADE,
 FOREIGN KEY(graph_version,node_id) REFERENCES hsi_memory.graph_nodes(graph_version,node_id)
);
ALTER TABLE hsi_memory.graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.graph_nodes FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.graph_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_memory.graph_links FORCE ROW LEVEL SECURITY;
REVOKE ALL ON hsi_memory.graph_nodes,hsi_memory.graph_links FROM PUBLIC;
CREATE FUNCTION hsi_memory.read_graph_links(p_token text,p_tenant text,p_scope text,p_graph text,p_ids uuid[])
RETURNS TABLE(record_id uuid,version integer,node_id text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $links$
DECLARE a text;
BEGIN
 a:=hsi_memory.resolve_principal(p_token);
 IF a IS NULL OR hsi_memory.active_membership(a,p_tenant,p_scope) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Memory unavailable' USING ERRCODE='42501'; END IF;
 IF p_graph IS NULL OR p_graph !~ '^[a-f0-9]{64}$' OR p_ids IS NULL OR cardinality(p_ids) NOT BETWEEN 1 AND 100 OR array_position(p_ids,NULL) IS NOT NULL THEN RAISE EXCEPTION 'Invalid graph selection' USING ERRCODE='22023'; END IF;
 RETURN QUERY SELECT r.id,r.current_version,l.node_id FROM hsi_memory.records r JOIN hsi_memory.graph_links l ON (l.tenant_id,l.scope_id,l.record_id,l.version)=(r.tenant_id,r.scope_id,r.id,r.current_version)
 WHERE r.tenant_id=p_tenant AND r.scope_id=p_scope AND r.id=ANY(p_ids) AND l.graph_version=p_graph AND r.state='active' AND r.retention_until>clock_timestamp()
 AND (r.owner_id=a OR (r.visibility='shared' AND EXISTS(SELECT 1 FROM hsi_memory.grants g WHERE (g.tenant_id,g.scope_id,g.record_id)=(r.tenant_id,r.scope_id,r.id) AND g.principal_id=a AND g.revoked_at IS NULL AND g.expires_at>clock_timestamp())))
 ORDER BY r.id,l.node_id;
END $links$;
REVOKE ALL ON FUNCTION hsi_memory.read_graph_links(text,text,text,text,uuid[]) FROM PUBLIC;
