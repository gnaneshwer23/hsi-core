-- Offline retention candidate. Scheduler role must be separate from API runtime.
ALTER TABLE hsi_memory.events DROP CONSTRAINT events_operation_check;
ALTER TABLE hsi_memory.events ADD CHECK(operation IN ('create','revise','grant','revoke','delete','export','correction_proposal','retention_delete'));
CREATE INDEX memory_retention_due ON hsi_memory.records(retention_until,tenant_id,scope_id,id);
CREATE FUNCTION hsi_memory.sweep_expired(p_limit integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $retention$
DECLARE r record; n integer:=0;
BEGIN
 IF p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Invalid batch' USING ERRCODE='22023'; END IF;
 FOR r IN SELECT tenant_id,scope_id,id,current_version FROM hsi_memory.records WHERE retention_until<=clock_timestamp()
 ORDER BY retention_until,tenant_id,scope_id,id LIMIT p_limit FOR UPDATE SKIP LOCKED LOOP
 INSERT INTO hsi_memory.events(event_id,tenant_id,scope_id,record_id,actor_id,operation,version,request_id)
 VALUES(gen_random_uuid(),r.tenant_id,r.scope_id,r.id,'system:retention','retention_delete',r.current_version,gen_random_uuid());
 DELETE FROM hsi_memory.records WHERE tenant_id=r.tenant_id AND scope_id=r.scope_id AND id=r.id;
 n:=n+1;
 END LOOP;
 RETURN n;
END $retention$;
REVOKE ALL ON FUNCTION hsi_memory.sweep_expired(integer) FROM PUBLIC;
