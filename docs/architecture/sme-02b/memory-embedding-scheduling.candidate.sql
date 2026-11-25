-- Candidate transactional scheduling. No worker activation.
CREATE FUNCTION hsi_memory.schedule_embedding_on_version()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $schedule$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM hsi_memory.records r WHERE (r.tenant_id,r.scope_id,r.id)=(NEW.tenant_id,NEW.scope_id,NEW.id) AND r.current_version=NEW.current_version AND r.state='active' AND r.data_class='synthetic_demo' AND r.retention_until>clock_timestamp()) THEN RETURN NULL; END IF;
 UPDATE hsi_memory.embedding_jobs j SET state='cancelled',lease_id=NULL,lease_until=NULL
 WHERE (j.tenant_id,j.scope_id,j.record_id)=(NEW.tenant_id,NEW.scope_id,NEW.id)
 AND j.version<>NEW.current_version AND j.state IN ('queued','leased');
 IF NEW.state='active' AND NEW.data_class='synthetic_demo' AND NEW.retention_until>clock_timestamp() THEN
  INSERT INTO hsi_memory.embedding_jobs(tenant_id,scope_id,record_id,version,model)
  VALUES(NEW.tenant_id,NEW.scope_id,NEW.id,NEW.current_version,'hsi-synthetic-fixture-v1') ON CONFLICT DO NOTHING;
 END IF;
 RETURN NULL;
END $schedule$;
REVOKE ALL ON FUNCTION hsi_memory.schedule_embedding_on_version() FROM PUBLIC;
-- Deferred because create_record inserts the record before its first version.
CREATE CONSTRAINT TRIGGER schedule_embedding_version
AFTER INSERT OR UPDATE OF current_version ON hsi_memory.records
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
EXECUTE FUNCTION hsi_memory.schedule_embedding_on_version();
