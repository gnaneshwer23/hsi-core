/** Isolated engineering identities and synthetic receipts only. Not scientific or live-security acceptance. */
import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deliveryHarness } from './deliveryHarness';
import { contextUnit, fixtureHash } from './contextConflictAudit';
import { buildPassageLinkedContext } from '../../src/evidence/passageLinkedContext';
import {
  createContextConflictAuditRunner,
  type ContextConflictAudit,
} from '../../src/evidence/contextConflictAudit';
import { openContextAuditArchive } from '../../src/db/contextAuditArchiveStore';
import {
  createContextAuditArchiveService,
  type ContextAuditArchiveDependencies,
} from '../../src/server/contextAuditArchiveService';
import { handleInterrogativeApi } from '../../src/server/interrogativeApi';
export async function auditArchiveFixture() {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'hsi-audit-reference-'))),
    path = join(dir, 'audit.sqlite');
  let store = openContextAuditArchive({ path, mode: 'isolated_reference' }),
    archive: ReturnType<typeof createContextAuditArchiveService>,
    enabled = true,
    sourceAllowed = true,
    reviewAllowed = true;
  const f = deliveryHarness({
    outcomeAttachments: {
      load: (a, p) => archive.attachments.load(a, p),
      authorize: (a, p, v) => archive.attachments.authorize(a, p, v),
    },
  });
  await f.service.submit('alice', f.initial.id);
  const p = (await f.service.view('alice', f.initial.id)).package!;
  const source = p.context.primary.bundle.sources[0]!,
    passage = p.context.primary.bundle.passages[0]!;
  const authenticate: ContextAuditArchiveDependencies['authenticate'] = async (token) =>
    token && ['alice', 'bob', 'reviewer', 'reviewer2', 'ra-reviewer', 'agent'].includes(token)
      ? {
          authenticated: true,
          principalId: token,
          roles: token === 'alice' || token === 'bob' ? ['researcher'] : ['scientific_reviewer'],
        }
      : null;
  const deps = () => ({
    enabled,
    store,
    authenticate,
    context: async (actor: { principalId: string }, id: string) => {
      if (id !== p.investigation.id) throw Error('Unavailable');
      return {
        tenantId: 'fixture-tenant-a',
        actorTenantId: actor.principalId === 'bob' ? 'fixture-tenant-b' : 'fixture-tenant-a',
        actorKind: actor.principalId === 'agent' ? ('ai_agent' as const) : ('human' as const),
        package: (await f.service.view('alice', id)).package!,
      };
    },
    reviewer: async (principal: string, tenant: string, scope: string) =>
      reviewAllowed &&
      tenant === 'fixture-tenant-a' &&
      ['reviewer', 'reviewer2', 'ra-reviewer'].includes(principal) &&
      (principal === 'ra-reviewer' ? scope === 'ra' : scope === 'ssc'),
    authorizeSources: async () => sourceAllowed,
    now: () => '2026-11-13T12:00:00.000Z',
  });
  const refresh = () => {
    archive = createContextAuditArchiveService(deps());
  };
  refresh();
  const runner = createContextConflictAuditRunner({
    enabled: true,
    search: async (_t, intent) => ({
      intent,
      status: intent === 'support' ? 'completed_bounded' : 'successful_empty',
      queriedAt: '2026-11-13T11:00:00.000Z',
      queryHash: fixtureHash(intent),
      sourceIds: intent === 'support' ? [source.id] : [],
      hits:
        intent === 'support'
          ? [
              {
                id: 'synthetic-hit',
                source,
                passage,
                clearanceReceiptId: 'synthetic-clearance-not-live',
              },
            ]
          : [],
    }),
    authorizePassage: async () => true,
    extract: async () => ({
      ...contextUnit('a').unit,
      evidenceSourceIds: [source.id],
      detailedContext: buildPassageLinkedContext({
        source,
        passage,
        clearanceReceiptId: 'synthetic-clearance-not-live',
        extractions: {},
      }),
    }),
    verify: async () => ({
      status: 'checked_with_limitations',
      receiptId: 'synthetic-verifier-not-live',
    }),
    append: async (a, expected) => {
      if (a.parentAuditHash !== expected) throw Error('Parent changed');
      await archive.append('alice', f.initial.id, a);
    },
  });
  let audit = await runner.run({
    investigationId: f.initial.id,
    diseaseScope: 'ssc',
    question: p.investigation.question,
    release: p.context.primary.release,
  });
  const request = () => ({
    requestId: '11111111-1111-4111-8111-111111111111',
    auditHash: audit.auditHash,
    decision: 'accept_with_limitations' as const,
    rationale: 'Synthetic engineering assessment; source context is incomplete.',
    limitations: ['Fixture only. No actual scientific approval.'],
    conflictOfInterestDeclared: true as const,
  });
  const services = () => ({
    auditArchive: archive,
    outcome: ({
      serverSessionToken,
      investigationId,
    }: {
      serverSessionToken: string | null;
      investigationId: string;
    }) => f.service.outcome(serverSessionToken, investigationId),
    outcomeReceipt: ({
      serverSessionToken,
      investigationId,
    }: {
      serverSessionToken: string | null;
      investigationId: string;
    }) => f.service.outcomeReceipt(serverSessionToken, investigationId),
    load: async () => null,
    submit: async () => null,
    review: async () => null,
  });
  const http = (action: string, actor = 'alice', body?: unknown) =>
    handleInterrogativeApi(
      new Request('https://hsi.test/api/research/interrogative/' + f.initial.id + '/' + action, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          cookie: 'better-auth.session_token=' + actor,
          origin: 'https://hsi.test',
          'content-type': 'application/json',
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      }),
      services(),
    );
  return {
    f,
    p,
    path,
    dir,
    get audit() {
      return audit;
    },
    get archive() {
      return archive;
    },
    get store() {
      return store;
    },
    deps,
    request,
    http,
    restart() {
      store.close();
      store = openContextAuditArchive({ path, mode: 'isolated_reference' });
      refresh();
    },
    async rerun() {
      audit = await runner.run(
        {
          investigationId: f.initial.id,
          diseaseScope: 'ssc',
          question: p.investigation.question,
          release: p.context.primary.release,
        },
        audit,
      );
      return audit;
    },
    revokeSources() {
      sourceAllowed = false;
    },
    revokeReviewers() {
      reviewAllowed = false;
    },
    disable() {
      enabled = false;
      refresh();
    },
    close() {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
