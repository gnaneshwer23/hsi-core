import { test, expect } from 'bun:test';
import { Database } from 'bun:sqlite';
import { mkdtempSync, realpathSync, rmSync, symlinkSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditArchiveFixture } from './fixtures/contextAuditArchive';
import { contextArchiveHash, openContextAuditArchive } from '../src/db/contextAuditArchiveStore';
import { createContextAuditArchiveService } from '../src/server/contextAuditArchiveService';
import { verifyReceiptedResearchOutcome, renderResearchOutcome } from '../src/researchOutcome';
import { deliveryHash } from '../src/server/investigationDeliveryService';

test('audit persists, reopens and exports the same package/version after process-style restart', async () => {
  const t = await auditArchiveFixture();
  try {
    const before = await t.f.service.outcome('alice', t.f.initial.id);
    t.restart();
    const after = await t.f.service.outcome('alice', t.f.initial.id);
    expect(after.outcomeHash).toBe(before.outcomeHash);
    expect(after.contextConflictAudit?.auditHash).toBe(t.audit.auditHash);
    expect(renderResearchOutcome(after, 'markdown')).toContain(t.audit.auditHash);
    expect(statSync(t.path).mode & 0o077).toBe(0);
    const receipt = await t.f.service.outcomeReceipt('alice', t.f.initial.id);
    const brief = {
      schemaVersion: 'hsi-investigation-brief-1' as const,
      package: t.p,
      submission: t.f.states.get(t.f.initial.id)!.submission,
      decision: null,
      scope: 'research_only' as const,
      graphPublicationApproved: false as const,
    };
    expect(
      (await verifyReceiptedResearchOutcome(after, receipt, brief, async (s) => deliveryHash(s)))
        .outcomeHash,
    ).toBe(after.outcomeHash);
    await expect(
      verifyReceiptedResearchOutcome(
        { ...after, question: 'Tampered' },
        receipt,
        brief,
        async (s) => deliveryHash(s),
      ),
    ).rejects.toThrow();
    expect(after.provenance.attachmentBinding?.packageHash).toBe(t.p.packageHash);
  } finally {
    t.close();
  }
});

test('independent audit assessment is immutable, idempotent, separately scoped and never approves a new audit', async () => {
  const t = await auditArchiveFixture();
  try {
    await expect(t.archive.decide('alice', t.f.initial.id, t.request())).rejects.toThrow();
    await expect(t.archive.decide('ra-reviewer', t.f.initial.id, t.request())).rejects.toThrow();
    await expect(t.archive.decide('agent', t.f.initial.id, t.request())).rejects.toThrow();
    const first = await t.archive.decide('reviewer', t.f.initial.id, t.request()),
      again = await t.archive.decide('reviewer', t.f.initial.id, t.request());
    expect(again).toEqual(first);
    await expect(t.archive.decide('reviewer2', t.f.initial.id, t.request())).rejects.toThrow();
    const out = await t.f.service.outcome('alice', t.f.initial.id);
    expect(out.contextConflictAuditReview?.decisionHash).toBe(first.decisionHash);
    expect(out.review.status).toBe('not_independently_reviewed');
    expect(out.contextConflictAudit?.scientificApproval).toBe(false);
    expect(out.contextConflictAudit?.graphPromotable).toBe(false);
    const old = t.audit.auditHash;
    await t.rerun();
    expect(t.audit.version).toBe(2);
    expect(t.audit.parentAuditHash).toBe(old);
    expect(t.store.read('fixture-tenant-a', t.f.initial.id, old)?.audit.auditHash).toBe(old);
    expect((await t.archive.view('reviewer', t.f.initial.id)).review).toBeNull();
    expect(
      (await t.f.service.outcome('alice', t.f.initial.id)).contextConflictAuditReview,
    ).toBeUndefined();
    await expect(
      t.archive.decide('reviewer', t.f.initial.id, { ...t.request(), auditHash: old }),
    ).rejects.toThrow();
  } finally {
    t.close();
  }
});

test('two store connections produce one immutable decision and conflicting attempts cannot overwrite it', async () => {
  const t = await auditArchiveFixture(),
    second = openContextAuditArchive({ path: t.path, mode: 'isolated_reference' });
  try {
    const other = createContextAuditArchiveService({ ...t.deps(), store: second });
    const results = await Promise.allSettled([
      t.archive.decide('reviewer', t.f.initial.id, t.request()),
      other.decide('reviewer2', t.f.initial.id, t.request()),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const db = new Database(t.path);
    try {
      expect(() => db.exec('DELETE FROM context_audits')).toThrow('Immutable');
      expect(() => db.exec("UPDATE context_audit_reviews SET payload='{}'")).toThrow('Immutable');
    } finally {
      db.close();
    }
    const record = await t.archive.view('alice', t.f.initial.id);
    expect(record.review?.scientificApproval).toBe(false);
  } finally {
    second.close();
    t.close();
  }
});

test('cross-tenant access, revoked sources/reviewer grants and forged request fields fail closed', async () => {
  const t = await auditArchiveFixture();
  try {
    expect((await t.http('context-audit', 'bob')).status).toBe(403);
    expect(
      (
        await t.http('context-audit-review', 'reviewer', {
          ...t.request(),
          reviewerPrincipal: 'forged',
        })
      ).status,
    ).toBe(403);
    await t.archive.decide('reviewer', t.f.initial.id, t.request());
    t.revokeReviewers();
    expect((await t.http('outcome', 'alice')).status).toBe(403);
    expect((await t.http('context-audit', 'reviewer')).status).toBe(403);
  } finally {
    t.close();
  }
  const revoked = await auditArchiveFixture();
  try {
    revoked.revokeSources();
    expect((await revoked.http('outcome-receipt')).status).toBe(403);
    expect((await revoked.http('outcome?format=markdown')).status).toBe(403);
  } finally {
    revoked.close();
  }
});

test('archive does not activate by default and rejects hash, release, parent and package substitution', async () => {
  const t = await auditArchiveFixture();
  try {
    const unbound = structuredClone(t.audit);
    unbound.release.manifestHash = 'b'.repeat(64);
    const { id: _, auditHash: __, ...body } = unbound;
    unbound.auditHash = contextArchiveHash(body);
    unbound.id = 'context-audit-' + unbound.auditHash.slice(0, 32);
    await expect(t.archive.append('alice', t.f.initial.id, unbound)).rejects.toThrow();
    const before = (await t.archive.view('alice', t.f.initial.id)).artifact!;
    expect((await t.archive.append('alice', t.f.initial.id, t.audit)).archiveHash).toBe(
      before.archiveHash,
    );
    const stale = structuredClone(t.audit);
    stale.version = 3;
    stale.parentAuditHash = t.audit.auditHash;
    const { id: _i, auditHash: _h, ...b } = stale;
    stale.auditHash = contextArchiveHash(b);
    stale.id = 'context-audit-' + stale.auditHash.slice(0, 32);
    await expect(t.archive.append('alice', t.f.initial.id, stale)).rejects.toThrow();
    t.disable();
    await expect(t.archive.view('alice', t.f.initial.id)).rejects.toThrow();
  } finally {
    t.close();
  }
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'hsi-audit-file-')));
  try {
    const a = openContextAuditArchive({
      path: join(dir, 'real.sqlite'),
      mode: 'isolated_reference',
    });
    a.close();
    symlinkSync(join(dir, 'real.sqlite'), join(dir, 'link.sqlite'));
    expect(() =>
      openContextAuditArchive({ path: join(dir, 'link.sqlite'), mode: 'isolated_reference' }),
    ).toThrow();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('source-bound failure artifacts remain inspectable but a failed verifier cannot be accepted', async () => {
  const t = await auditArchiveFixture();
  try {
    const v = structuredClone(t.audit);
    v.version = 2;
    v.parentAuditHash = t.audit.auditHash;
    v.verifier = { status: 'failed', receiptId: null };
    const { auditHash: _, id: __, ...body } = v;
    v.auditHash = contextArchiveHash(body);
    v.id = 'context-audit-' + v.auditHash.slice(0, 32);
    await t.archive.append('alice', t.f.initial.id, v);
    await expect(
      t.archive.decide('reviewer', t.f.initial.id, { ...t.request(), auditHash: v.auditHash }),
    ).rejects.toThrow('cannot be accepted');
    const review = await t.archive.decide('reviewer', t.f.initial.id, {
      ...t.request(),
      auditHash: v.auditHash,
      decision: 'needs_evidence',
    });
    expect(review.decision).toBe('needs_evidence');
    const later = createContextAuditArchiveService({
      ...t.deps(),
      now: () => '2026-11-13T13:00:00.000Z',
    });
    expect((await later.append('alice', t.f.initial.id, v)).audit.auditHash).toBe(v.auditHash);
  } finally {
    t.close();
  }
});

test('audit HTTP routes require current sessions, same-origin JSON and fixed server-owned scope', async () => {
  const t = await auditArchiveFixture();
  try {
    const { handleInterrogativeApi } = await import('../src/server/interrogativeApi');
    const services = {
      auditArchive: t.archive,
      load: async () => null,
      submit: async () => null,
      review: async () => null,
    };
    const base = 'https://hsi.test/api/research/interrogative/' + t.f.initial.id;
    expect(
      (await handleInterrogativeApi(new Request(base + '/context-audit'), services)).status,
    ).toBe(401);
    const cookie = 'better-auth.session_token=reviewer';
    expect(
      (
        await handleInterrogativeApi(
          new Request(base + '/context-audit?owner=alice', { headers: { cookie } }),
          services,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await handleInterrogativeApi(
          new Request(base + '/context-audit-review', {
            method: 'POST',
            headers: { cookie, origin: 'https://other.test', 'content-type': 'application/json' },
            body: JSON.stringify(t.request()),
          }),
          services,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await handleInterrogativeApi(
          new Request(base + '/context-audit', {
            method: 'POST',
            headers: { cookie, origin: 'https://hsi.test', 'content-type': 'application/json' },
            body: JSON.stringify(t.audit),
          }),
          services,
        )
      ).status,
    ).toBe(405);
    expect(
      (
        await handleInterrogativeApi(
          new Request(base + '/context-audit', { headers: { cookie } }),
          { load: async () => null, submit: async () => null, review: async () => null },
        )
      ).status,
    ).toBe(503);
  } finally {
    t.close();
  }
});
