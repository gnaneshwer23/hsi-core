/** Synthetic HTTP/UI fixtures. Durable storage is tested separately with real isolated SQLite files.
 * This suite certifies neither provider login, Neon isolation, real reviewers nor scientific validity.
 */
import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { deliveryHarness } from '../../test/fixtures/deliveryHarness';
import { contextUnit, fixtureHash } from '../../test/fixtures/contextConflictAudit';
import { createContextConflictAuditRunner } from '../../src/evidence/contextConflictAudit';
import { buildPassageLinkedContext } from '../../src/evidence/passageLinkedContext';
import { createContextAuditArchiveService } from '../../src/server/contextAuditArchiveService';
import type { ArchivedContextAudit } from '../../src/evidence/contextAuditArchive';
import type { ContextAuditReview } from '../../src/evidence/contextAuditReview';
import { canonicalGraphContext } from '../../src/investigationGraphContext';
import { renderResearchOutcome } from '../../src/researchOutcome';
import { deliveryHash } from '../../src/server/investigationDeliveryService';
async function fixture() {
  const rows: ArchivedContextAudit[] = [],
    reviews = new Map<string, ContextAuditReview>();
  let sourceAllowed = true;
  let archive: ReturnType<typeof createContextAuditArchiveService>;
  const f = deliveryHarness({
    outcomeAttachments: {
      load: (a, p) => archive.attachments.load(a, p),
      authorize: (a, p, v) => archive.attachments.authorize(a, p, v),
    },
  });
  await f.service.submit('alice', f.initial.id);
  const p = (await f.service.view('alice', f.initial.id)).package!,
    source = p.context.primary.bundle.sources[0]!,
    passage = p.context.primary.bundle.passages[0]!;
  archive = createContextAuditArchiveService({
    enabled: true,
    store: {
      latest: (tenant, id) =>
        rows
          .filter((r) => r.binding.tenantId === tenant && r.binding.investigationId === id)
          .at(-1) ?? null,
      read: (tenant, id, hash) =>
        rows.find(
          (r) =>
            r.binding.tenantId === tenant &&
            r.binding.investigationId === id &&
            r.audit.auditHash === hash,
        ) ?? null,
      review: (_t, _i, hash) => reviews.get(hash) ?? null,
      append: (r) => {
        const old = rows.find((x) => x.audit.auditHash === r.audit.auditHash);
        if (old) return old;
        rows.push(r);
        return r;
      },
      decide: (_r, v) => {
        const old = reviews.get(v.auditHash);
        if (old) {
          if (old.requestHash !== v.requestHash || old.reviewerPrincipal !== v.reviewerPrincipal)
            throw Error();
          return old;
        }
        reviews.set(v.auditHash, v);
        return v;
      },
      close: () => {},
    },
    authenticate: async (token) =>
      token && ['alice', 'reviewer'].includes(token)
        ? {
            authenticated: true,
            principalId: token,
            roles: token === 'alice' ? ['researcher'] : ['scientific_reviewer'],
          }
        : null,
    context: async () => ({
      tenantId: 'synthetic-tenant',
      actorTenantId: 'synthetic-tenant',
      actorKind: 'human',
      package: p,
    }),
    reviewer: async (principal) => principal === 'reviewer',
    authorizeSources: async () => sourceAllowed,
    now: () => '2026-11-13T12:00:00.000Z',
  });
  const runner = createContextConflictAuditRunner({
    enabled: true,
    search: async (_t, intent) => ({
      intent,
      status: intent === 'support' ? 'completed_bounded' : 'successful_empty',
      queriedAt: '2026-11-13T11:00:00Z',
      queryHash: fixtureHash(intent),
      sourceIds: intent === 'support' ? [source.id] : [],
      hits:
        intent === 'support'
          ? [{ id: 'fixture-hit', source, passage, clearanceReceiptId: 'synthetic-clearance-only' }]
          : [],
    }),
    authorizePassage: async () => true,
    extract: async () => ({
      ...contextUnit('a').unit,
      evidenceSourceIds: [source.id],
      detailedContext: buildPassageLinkedContext({
        source,
        passage,
        clearanceReceiptId: 'synthetic-clearance-only',
        extractions: {},
      }),
    }),
    verify: async () => ({
      status: 'checked_with_limitations',
      receiptId: 'synthetic-verifier-only',
    }),
    append: async (a) => {
      await archive.append('alice', f.initial.id, a);
    },
  });
  const audit = await runner.run({
    investigationId: f.initial.id,
    diseaseScope: 'ssc',
    question: p.investigation.question,
    release: p.context.primary.release,
  });
  return {
    f,
    archive,
    audit,
    reviews,
    revoke: () => {
      sourceAllowed = false;
    },
  };
}
async function wire(
  page: Page,
  t: Awaited<ReturnType<typeof fixture>>,
  actor: string,
  loseAck = false,
) {
  const requests: string[] = [];
  await page.route('**/api/research/interrogative/**', async (route) => {
    const url = new URL(route.request().url()),
      id = t.f.initial.id,
      action = url.pathname.split('/').at(-1);
    try {
      if (action === id) {
        await t.f.service.view(actor, id);
        return route.fulfill({ json: t.f.states.get(id)!.record });
      }
      if (action === 'review-package')
        return route.fulfill({ json: await t.f.service.view(actor, id) });
      if (action === 'graph-context')
        return route.fulfill({
          json: { status: 'saved', canCapture: false, context: t.f.contexts.get(id) },
        });
      if (action === 'outcome-receipt')
        return route.fulfill({ json: await t.f.service.outcomeReceipt(actor, id) });
      if (action === 'context-audit')
        return route.fulfill({ json: await t.archive.view(actor, id) });
      if (action === 'context-audit-review') {
        const body = route.request().postDataJSON();
        expect(Object.keys(body).sort()).toEqual([
          'auditHash',
          'conflictOfInterestDeclared',
          'decision',
          'limitations',
          'rationale',
          'requestId',
        ]);
        requests.push(body.requestId);
        const review = await t.archive.decide(actor, id, body);
        if (loseAck && requests.length === 1) return route.abort('failed');
        return route.fulfill({ json: review });
      }
      if (action === 'outcome') {
        const o = await t.f.service.outcome(actor, id),
          format = url.searchParams.get('format');
        if (!format) return route.fulfill({ json: o });
        if (format !== 'json' && format !== 'markdown') throw Error();
        const text = renderResearchOutcome(o, format);
        return route.fulfill({
          body: text,
          headers: {
            'content-type': format === 'json' ? 'application/json' : 'text/markdown',
            'x-hsi-content-sha256': deliveryHash(text),
            'x-hsi-package-sha256': o.binding.packageHash,
            'x-hsi-outcome-sha256': o.outcomeHash,
          },
        });
      }
      return route.fulfill({ status: 404 });
    } catch {
      return route.fulfill({
        status: 403,
        json: { error: 'Synthetic access denied or binding changed' },
      });
    }
  });
  return requests;
}
async function open(page: Page, id: string) {
  await page.goto('/research/decision-workbench?investigation=' + id);
  const panel = page.getByRole('region', { name: 'Unified research outcome', exact: true });
  await expect(panel).toContainText('Not calibrated');
  await panel.getByRole('button', { name: '02 Evidence', exact: true }).click();
  return panel;
}

test('saved audit reopens with source/context binding, owner cannot self-review and exports keep no-approval status', async ({
  page,
}) => {
  const t = await fixture();
  await wire(page, t, 'alice');
  let panel = await open(page, t.f.initial.id);
  const audit = panel.getByRole('region', { name: 'Saved context-conflict audit', exact: true });
  await expect(audit).toContainText(t.audit.auditHash);
  await expect(audit).toContainText('Independent audit assessment is still required');
  await expect(
    audit.getByRole('button', { name: 'Record independent audit assessment' }),
  ).toHaveCount(0);
  const event = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download outcome JSON', exact: true }).click();
  const data = JSON.parse(await readFile((await (await event).path())!, 'utf8'));
  expect(data.contextConflictAudit.auditHash).toBe(t.audit.auditHash);
  expect(data.contextConflictAudit.scientificApproval).toBe(false);
  expect(data.contextConflictAudit.graphPromotable).toBe(false);
  await page.reload();
  panel = page.getByRole('region', { name: 'Unified research outcome', exact: true });
  // Reload restores the Evidence section from its URL anchor, not the Landscape tab.
  await expect(
    panel.getByRole('region', { name: 'Saved context-conflict audit', exact: true }),
  ).toContainText(t.audit.auditHash);
  const md = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download research outcome', exact: true }).click();
  expect(await readFile((await (await md).path())!, 'utf8')).toContain(
    'No scientific approval or graph promotion',
  );
});

test('independent reviewer records an audit-hash assessment; lost acknowledgement retries one immutable request', async ({
  page,
}) => {
  const t = await fixture(),
    requests = await wire(page, t, 'reviewer', true),
    panel = await open(page, t.f.initial.id);
  const form = panel.getByRole('region', {
    name: 'Independent context-audit assessment',
    exact: true,
  });
  await form
    .getByLabel('Audit assessment', { exact: true })
    .selectOption('accept_with_limitations');
  await form
    .getByLabel('Audit scientific rationale', { exact: true })
    .fill('Synthetic review: retain source-model uncertainty and the empty opposing search.');
  await form
    .getByLabel('Assessment limitations, one per line', { exact: true })
    .fill('Engineering fixture only; not a real expert assessment.');
  await form.getByLabel('I have declared relevant conflicts of interest.', { exact: true }).check();
  await form
    .getByRole('button', { name: 'Record independent audit assessment', exact: true })
    .click();
  await expect(form).toContainText('could not be confirmed');
  await form
    .getByRole('button', { name: 'Record independent audit assessment', exact: true })
    .click();
  await expect(
    panel.getByRole('heading', { name: 'Independent audit assessment', exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[1]).toBe(requests[0]);
  expect(t.reviews.size).toBe(1);
  const saved = t.reviews.get(t.audit.auditHash)!;
  await expect(panel).toContainText(saved.decisionHash);
  expect(saved.scientificApproval).toBe(false);
  expect(saved.scope).toBe('context_audit_only');
  await expect(panel).toContainText('not independently reviewed');
});

test('self-resealed outcome is rejected without a matching freshly authorized receipt; revocation removes stale content', async ({
  page,
}) => {
  const t = await fixture();
  await wire(page, t, 'alice');
  await page.route('**/outcome', async (route) => {
    const o = await t.f.service.outcome('alice', t.f.initial.id);
    o.answer.summary = 'Forged self-resealed scientific answer';
    const { outcomeHash: _, ...body } = o;
    o.outcomeHash = deliveryHash(canonicalGraphContext(body));
    return route.fulfill({ json: o });
  });
  await page.goto('/research/decision-workbench?investigation=' + t.f.initial.id);
  const panel = page.getByRole('region', { name: 'Unified research outcome', exact: true });
  await expect(panel).toContainText('could not be verified');
  await expect(panel).not.toContainText('Forged self-resealed');
  await page.unroute('**/outcome');
  await panel.getByRole('button', { name: 'Refresh outcome', exact: true }).click();
  await expect(panel).toContainText('Not calibrated');
  t.revoke();
  await panel.getByRole('button', { name: 'Refresh outcome', exact: true }).click();
  await expect(panel).toContainText('could not be verified');
  await expect(panel).not.toContainText('Not calibrated');
});

test('audit assessment is usable on mobile and desktop with accessible controls and no horizontal overflow', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const t = await fixture();
  await wire(page, t, 'reviewer');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const panel = await open(page, t.f.initial.id);
    await expect(panel.getByLabel('Audit assessment', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    const result = await new AxeBuilder({ page })
      .include('.research-outcome')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
      })),
    ).toEqual([]);
    await page.evaluate(() => {
      (document.activeElement as HTMLElement)?.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: info.outputPath('saved-audit-assessment-' + width + '.png'),
      fullPage: true,
    });
  }
});
