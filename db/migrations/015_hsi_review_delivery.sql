-- Phase D. Review/apply only to approved HSI staging. No grants, migration execution or approvals implied.
BEGIN;
CREATE TABLE IF NOT EXISTS hsi_review_submissions (
 submission_id text PRIMARY KEY,
 investigation_id text NOT NULL UNIQUE REFERENCES hsi_interrogative_investigations(id),
 submitted_by text NOT NULL,
 submitted_at timestamptz NOT NULL,
 package_hash text NOT NULL CHECK(package_hash ~ '^[a-f0-9]{64}$'),
 investigation_hash text NOT NULL CHECK(investigation_hash ~ '^[a-f0-9]{64}$'),
 context_hash text NOT NULL CHECK(context_hash ~ '^[a-f0-9]{64}$'),
 package_payload jsonb NOT NULL,
 UNIQUE(submission_id,investigation_id),
 CHECK((package_payload->>'packageHash'=package_hash) IS TRUE),
 CHECK((package_payload->>'investigationHash'=investigation_hash) IS TRUE),
 CHECK((package_payload->'context'->>'contentHash'=context_hash) IS TRUE),
 CHECK((package_payload->'investigation'->>'id'=investigation_id) IS TRUE)
);
CREATE TABLE IF NOT EXISTS hsi_review_decisions_v2 (
 decision_id text PRIMARY KEY,
 submission_id text NOT NULL UNIQUE REFERENCES hsi_review_submissions(submission_id),
 investigation_id text NOT NULL UNIQUE REFERENCES hsi_interrogative_investigations(id),
 reviewer_principal text NOT NULL,
 outcome text NOT NULL CHECK(outcome IN ('approve_with_limitations','request_revision','reject')),
 reviewed_at timestamptz NOT NULL,
 decision_hash text NOT NULL CHECK(decision_hash ~ '^[a-f0-9]{64}$'),
 decision_payload jsonb NOT NULL,
 UNIQUE(decision_id,investigation_id),
 FOREIGN KEY(submission_id,investigation_id) REFERENCES hsi_review_submissions(submission_id,investigation_id),
 CHECK((decision_payload->>'decisionHash'=decision_hash) IS TRUE),
 CHECK((decision_payload->>'submissionId'=submission_id) IS TRUE),
 CHECK((decision_payload->>'investigationId'=investigation_id) IS TRUE),
 CHECK((decision_payload->>'reviewerPrincipal'=reviewer_principal) IS TRUE)
);
CREATE TABLE IF NOT EXISTS hsi_investigation_revision_links (
 investigation_id text PRIMARY KEY REFERENCES hsi_interrogative_investigations(id),
 parent_id text NOT NULL UNIQUE REFERENCES hsi_interrogative_investigations(id),
 root_id text NOT NULL REFERENCES hsi_interrogative_investigations(id),
 revision_number integer NOT NULL CHECK(revision_number>=2),
 parent_decision_id text NOT NULL REFERENCES hsi_review_decisions_v2(decision_id),
 author_principal text NOT NULL,
 request_id text NOT NULL,
 input_hash text NOT NULL CHECK(input_hash ~ '^[a-f0-9]{64}$'),
 reason text NOT NULL CHECK(length(trim(reason))>=30 AND length(reason)<=3000),
 created_at timestamptz NOT NULL,
 FOREIGN KEY(parent_decision_id,parent_id) REFERENCES hsi_review_decisions_v2(decision_id,investigation_id),
 UNIQUE(root_id,revision_number),UNIQUE(author_principal,request_id),CHECK(investigation_id<>parent_id)
);
CREATE OR REPLACE FUNCTION hsi_immutable_review_delivery() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Review submissions, decisions and revision lineage are append-only'; END $$;
DROP TRIGGER IF EXISTS hsi_submission_immutable ON hsi_review_submissions;
CREATE TRIGGER hsi_submission_immutable BEFORE UPDATE OR DELETE ON hsi_review_submissions FOR EACH ROW EXECUTE FUNCTION hsi_immutable_review_delivery();
DROP TRIGGER IF EXISTS hsi_decision_v2_immutable ON hsi_review_decisions_v2;
CREATE TRIGGER hsi_decision_v2_immutable BEFORE UPDATE OR DELETE ON hsi_review_decisions_v2 FOR EACH ROW EXECUTE FUNCTION hsi_immutable_review_delivery();
DROP TRIGGER IF EXISTS hsi_revision_link_immutable ON hsi_investigation_revision_links;
CREATE TRIGGER hsi_revision_link_immutable BEFORE UPDATE OR DELETE ON hsi_investigation_revision_links FOR EACH ROW EXECUTE FUNCTION hsi_immutable_review_delivery();
CREATE INDEX IF NOT EXISTS hsi_review_submission_queue_idx ON hsi_review_submissions(submitted_at DESC,submission_id DESC);
REVOKE ALL ON hsi_review_submissions,hsi_review_decisions_v2,hsi_investigation_revision_links FROM PUBLIC;
COMMIT;
