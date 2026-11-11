-- A-01 DRAFT ONLY. DO NOT APPLY without HSI security approval and least-privilege role review.
-- Dedicated public-source research evidence, never patient data or approved scientific graph.
CREATE TABLE IF NOT EXISTS public.hsi_live_investigations(
 id text PRIMARY KEY CHECK(id ~ '^hsi-live-[a-f0-9]{32}$'),
 owner_id text NOT NULL,
 request_id uuid NOT NULL,
 question text NOT NULL CHECK(length(question) BETWEEN 5 AND 400),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>=1),
 bundle jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_id,request_id),
 CHECK(bundle ? 'containsPhi' AND bundle ? 'clinicalAdvice' AND bundle ? 'kgWrite' AND bundle->>'containsPhi'='false' AND bundle->>'clinicalAdvice'='false' AND bundle->>'kgWrite'='false'),
 CHECK(bundle ? 'context' AND bundle->'context' ? 'dataClass' AND bundle->'context'->>'dataClass'='public_real'),
 CHECK(bundle->'context' ? 'question' AND bundle->'context'->>'question'=question)
);
CREATE INDEX IF NOT EXISTS hsi_live_investigations_owner_created ON public.hsi_live_investigations(owner_id,created_at DESC,id DESC);
ALTER TABLE public.hsi_live_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsi_live_investigations FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.hsi_live_investigations FROM PUBLIC;
-- No blanket RLS policy. Service must use reviewed owner-scoped database role/
-- verified session context and fail closed until policy is explicitly approved.

-- The dedicated hsi_live_runtime role must exist before this held migration is applied.\n-- Draft RLS policy. The runtime role still requires a separately reviewed,
-- explicit table grant; PUBLIC privileges remain revoked. No policy is a
-- substitute for least-privilege credentials and server-side session checks.
CREATE POLICY hsi_live_owner_isolation ON public.hsi_live_investigations
 FOR ALL TO hsi_live_runtime
 USING (owner_id = NULLIF(current_setting('hsi.live_owner_id',true),''))
 WITH CHECK (owner_id = NULLIF(current_setting('hsi.live_owner_id',true),''));
-- Operational approval must verify runtime role is not owner, SUPERUSER,
-- BYPASSRLS, or a member of a privileged database role.
