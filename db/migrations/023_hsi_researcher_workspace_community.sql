-- Researcher interests, follows, in-app notifications, and community posts.
-- NOT APPLIED by this commit. Held in HELD_MIGRATION_IDS.
-- No email or SMS column can be enabled. Patient data cannot be stored.
-- Nothing is shared unless shared_by_owner is true.
--
-- Rollback (HSI Neon project only, after a backup):
--   DROP TABLE IF EXISTS hsi_community_reports;
--   DROP TABLE IF EXISTS hsi_community_comments;
--   DROP TABLE IF EXISTS hsi_community_posts;
--   DROP TABLE IF EXISTS hsi_digest_preferences;
--   DROP TABLE IF EXISTS hsi_researcher_notifications;
--   DROP TABLE IF EXISTS hsi_researcher_follows;
--   DROP TABLE IF EXISTS hsi_researcher_interests;

CREATE TABLE IF NOT EXISTS hsi_researcher_interests (
  id text PRIMARY KEY,
  owner_principal text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('disease', 'pathway', 'cell', 'target')),
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hsi_researcher_follows (
  id text PRIMARY KEY,
  owner_principal text NOT NULL,
  topic text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_principal, topic)
);

CREATE TABLE IF NOT EXISTS hsi_researcher_notifications (
  id text PRIMARY KEY,
  owner_principal text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('evidence', 'contradiction', 'gap', 'hypothesis', 'review_request')),
  body text NOT NULL,
  external_delivery text NOT NULL CHECK (external_delivery = 'disabled'),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE TABLE IF NOT EXISTS hsi_digest_preferences (
  owner_principal text PRIMARY KEY,
  cadence text NOT NULL CHECK (cadence IN ('off', 'daily', 'weekly')),
  channel text NOT NULL CHECK (channel = 'in_app_only'),
  email_enabled boolean NOT NULL CHECK (email_enabled = false),
  sms_enabled boolean NOT NULL CHECK (sms_enabled = false)
);

CREATE TABLE IF NOT EXISTS hsi_community_posts (
  id text PRIMARY KEY,
  owner_principal text NOT NULL,
  author_label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('investigation', 'gap', 'hypothesis')),
  body text NOT NULL,
  evidence_tier text NOT NULL,
  provenance jsonb NOT NULL,
  shared_by_owner boolean NOT NULL CHECK (shared_by_owner),
  contains_patient_data boolean NOT NULL CHECK (contains_patient_data = false),
  review_status text NOT NULL CHECK (review_status IN ('not_independently_reviewed', 'comments_recorded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hsi_community_comments (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES hsi_community_posts(id),
  author_label text NOT NULL,
  body text NOT NULL,
  contains_patient_data boolean NOT NULL CHECK (contains_patient_data = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hsi_community_reports (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES hsi_community_posts(id),
  reporter_principal text NOT NULL,
  reason text NOT NULL,
  moderation_state text NOT NULL CHECK (moderation_state = 'report_recorded_no_moderator'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hsi_researcher_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_researcher_interests FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_researcher_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_researcher_follows FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_researcher_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_researcher_notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_digest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_digest_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_community_posts FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_community_comments FORCE ROW LEVEL SECURITY;
ALTER TABLE hsi_community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsi_community_reports FORCE ROW LEVEL SECURITY;

REVOKE ALL ON hsi_researcher_interests, hsi_researcher_follows, hsi_researcher_notifications, hsi_digest_preferences, hsi_community_posts, hsi_community_comments, hsi_community_reports FROM PUBLIC;
