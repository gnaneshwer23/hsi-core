import { canonicalGraphContext } from '../investigationGraphContext';
import { verifyReviewPackage, type ReviewPackage } from '../investigationDelivery';
import type { TrustedResearchActor } from '../db/researchInvestigationStore';
import {
  contextArchiveHash,
  contextArchiveDigest,
  assertArchiveIntegrity,
  type AuditArchiveBinding,
  type ArchivedContextAudit,
} from '../evidence/contextAuditArchive';
import type { ContextAuditArchiveStore } from '../db/contextAuditArchiveStore';
import {
  validateContextConflictAudit,
  type ContextConflictAudit,
} from '../evidence/contextConflictAudit';
import {
  parseContextAuditReviewRequest,
  verifyContextAuditReview,
  type ContextAuditReview,
} from '../evidence/contextAuditReview';
import type { OutcomeAttachmentResolver } from './boundOutcomeAttachments';
import { assertContextAuditPackageBinding } from '../researchOutcome';

export type ContextAuditAccess = {
  tenantId: string;
  actorTenantId: string;
  actorKind: 'human' | 'ai_agent' | 'service';
  package: ReviewPackage;
};
export type ContextAuditArchiveDependencies = {
  enabled?: boolean;
  store: ContextAuditArchiveStore;
  authenticate: (token: string | null) => Promise<TrustedResearchActor | null>;
  /** Current server-owned tenant membership and saved package; never HTTP owner/session settings. */
  context: (
    actor: Readonly<TrustedResearchActor>,
    investigationId: string,
  ) => Promise<ContextAuditAccess>;
  reviewer: (principal: string, tenantId: string, scope: 'ssc' | 'ra') => Promise<boolean>;
  authorizeSources: (
    actor: Readonly<TrustedResearchActor>,
    audit: Readonly<ContextConflictAudit>,
    actions: readonly ['storage', 'display', 'comparison', 'export'],
  ) => Promise<boolean>;
  now?: () => string;
};
export function createContextAuditArchiveService(deps: ContextAuditArchiveDependencies) {
  const digest = async (s: string) => contextArchiveDigest(s);
  async function access(actor: TrustedResearchActor | null, id: string) {
    if (
      deps.enabled !== true ||
      !actor?.authenticated ||
      !actor.principalId ||
      !/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(id)
    )
      throw Error('Audit archive unavailable');
    actor = structuredClone(actor);
    const c = structuredClone(await deps.context(actor, id));
    const p = await verifyReviewPackage(c.package, digest),
      d = p.context.primary.disease,
      scope = d === 'systemic_sclerosis' ? 'ssc' : d === 'rheumatoid_arthritis' ? 'ra' : null;
    if (
      !scope ||
      !c.tenantId?.trim() ||
      c.tenantId !== c.actorTenantId ||
      c.actorKind !== 'human' ||
      p.investigation.id !== id
    )
      throw Error('Audit scope unavailable');
    const owner =
      p.investigation.actorPrincipal === actor.principalId &&
      actor.roles.some((r) => r === 'researcher' || r === 'research_admin');
    const independent =
      !owner &&
      actor.principalId !== p.investigation.actorPrincipal &&
      actor.roles.includes('scientific_reviewer') &&
      (await deps.reviewer(actor.principalId, c.tenantId, scope));
    if (!owner && !independent) throw Error('Audit access denied');
    const binding: AuditArchiveBinding = {
      tenantId: c.tenantId,
      ownerPrincipal: p.investigation.actorPrincipal,
      investigationId: id,
      packageHash: p.packageHash,
      contextHash: p.context.contentHash,
      releaseId: p.context.primary.release.id,
      releaseVersion: p.context.primary.release.version,
      manifestHash: p.context.primary.release.manifestHash,
      diseaseScope: scope,
    };
    return { actor, p, binding, owner, independent };
  }
  async function fromToken(token: string | null, id: string) {
    if (!token || deps.enabled !== true) throw Error('Verified session and audit archive required');
    return access(await deps.authenticate(token), id);
  }
  async function check(a: Awaited<ReturnType<typeof access>>, row: ArchivedContextAudit) {
    assertArchiveIntegrity(row);
    if (canonicalGraphContext(a.binding) !== canonicalGraphContext(row.binding))
      throw Error('Audit is outside this saved package');
    assertContextAuditPackageBinding(row.audit, a.p);
    if (
      (await deps.authorizeSources(a.actor, structuredClone(row.audit), [
        'storage',
        'display',
        'comparison',
        'export',
      ])) !== true
    )
      throw Error('Current audit source permissions required');
    const review = deps.store.review(
      a.binding.tenantId,
      a.binding.investigationId,
      row.audit.auditHash,
    );
    if (review) {
      await verifyContextAuditReview(
        review,
        {
          auditHash: row.audit.auditHash,
          investigationId: a.binding.investigationId,
          packageHash: a.binding.packageHash,
          contextHash: a.binding.contextHash,
          diseaseScope: a.binding.diseaseScope,
        },
        digest,
      );
      if (
        review.archiveHash !== row.archiveHash ||
        review.tenantId !== a.binding.tenantId ||
        review.ownerPrincipal !== a.binding.ownerPrincipal ||
        !(await deps.reviewer(review.reviewerPrincipal, a.binding.tenantId, a.binding.diseaseScope))
      )
        throw Error('Audit review authority revoked or unbound');
    }
    return review;
  }
  const service = {
    /** Trusted runner sink only: the HTTP API never accepts an audit payload. */
    async append(token: string | null, id: string, input: ContextConflictAudit) {
      const a = await fromToken(token, id);
      if (!a.owner || a.p.investigation.state !== 'awaiting_scientific_review')
        throw Error('Owned immutable submitted package required before audit capture');
      const audit = structuredClone(input);
      validateContextConflictAudit(audit);
      assertContextAuditPackageBinding(audit, a.p);
      const existing = deps.store.read(a.binding.tenantId, id, audit.auditHash);
      if (existing) {
        if (canonicalGraphContext(existing.audit) !== canonicalGraphContext(audit))
          throw Error('Audit replay changed content');
        await check(a, existing);
        return existing;
      }
      const body = {
        schemaVersion: 'hsi-context-audit-archive-1' as const,
        binding: a.binding,
        audit,
        storedAt: deps.now?.() ?? new Date().toISOString(),
      };
      const row = { ...body, archiveHash: contextArchiveHash(body) };
      await check(a, row);
      const latest = await access(a.actor, id);
      if (canonicalGraphContext(latest.binding) !== canonicalGraphContext(a.binding))
        throw Error('Saved investigation changed');
      const stored = deps.store.append(row);
      await check(await access(a.actor, id), stored);
      return stored;
    },
    async view(token: string | null, id: string) {
      const a = await fromToken(token, id),
        row = deps.store.latest(a.binding.tenantId, id);
      if (!row) return { artifact: null, review: null, canReview: false };
      const review = await check(a, row);
      return { artifact: row, review, canReview: a.independent && !review };
    },
    async decide(token: string | null, id: string, input: unknown) {
      const request = parseContextAuditReviewRequest(input),
        a = await fromToken(token, id);
      if (!a.independent) throw Error('Independent scoped human reviewer required');
      const row = deps.store.latest(a.binding.tenantId, id);
      if (!row || row.audit.auditHash !== request.auditHash)
        throw Error('Current audit hash required');
      const prior = await check(a, row);
      if (prior) {
        if (
          prior.requestHash === contextArchiveHash(request) &&
          prior.reviewerPrincipal === a.actor.principalId
        )
          return prior;
        throw Error('Audit already decided');
      }
      if (
        request.decision === 'accept_with_limitations' &&
        (row.audit.blockedReason ||
          !row.audit.units.length ||
          row.audit.verifier.status !== 'checked_with_limitations')
      )
        throw Error('Blocked, empty or unverified audit cannot be accepted');
      const body = {
        schemaVersion: 'hsi-context-audit-review-1' as const,
        ...request,
        requestHash: contextArchiveHash(request),
        investigationId: id,
        packageHash: a.binding.packageHash,
        contextHash: a.binding.contextHash,
        archiveHash: row.archiveHash,
        tenantId: a.binding.tenantId,
        ownerPrincipal: a.binding.ownerPrincipal,
        reviewerPrincipal: a.actor.principalId,
        diseaseScope: a.binding.diseaseScope,
        reviewedAt: deps.now?.() ?? new Date().toISOString(),
        scope: 'context_audit_only' as const,
        scientificApproval: false as const,
        graphPromotable: false as const,
      };
      const decisionHash = contextArchiveHash(body),
        review: ContextAuditReview = {
          ...body,
          id: 'audit-review-' + decisionHash.slice(0, 32),
          decisionHash,
        };
      await verifyContextAuditReview(
        review,
        {
          auditHash: row.audit.auditHash,
          investigationId: id,
          packageHash: a.binding.packageHash,
          contextHash: a.binding.contextHash,
          diseaseScope: a.binding.diseaseScope,
        },
        digest,
      );
      const current = await access(a.actor, id);
      if (
        !current.independent ||
        canonicalGraphContext(current.binding) !== canonicalGraphContext(a.binding)
      )
        throw Error('Review authority changed');
      await check(current, row);
      const saved = deps.store.decide(row, review);
      await check(await access(a.actor, id), row);
      return saved;
    },
  };
  const attachments: OutcomeAttachmentResolver = {
    async load(actor, p) {
      const a = await access(structuredClone(actor), p.investigation.id);
      if (a.p.packageHash !== p.packageHash) throw Error('Attachment package changed');
      const row = deps.store.latest(a.binding.tenantId, p.investigation.id);
      if (!row) return null;
      const review = await check(a, row);
      const options = {
        contextConflictAudit: row.audit,
        ...(review ? { contextConflictAuditReview: review } : {}),
      };
      return {
        investigationId: a.binding.investigationId,
        packageHash: a.binding.packageHash,
        contextHash: a.binding.contextHash,
        releaseId: a.binding.releaseId,
        manifestHash: a.binding.manifestHash,
        attachmentsHash: contextArchiveHash(options),
        options,
      };
    },
    async authorize(actor, p, value) {
      const a = await access(structuredClone(actor), p.investigation.id);
      const row = deps.store.latest(a.binding.tenantId, p.investigation.id);
      if (
        !row ||
        row.audit.auditHash !== value.options.contextConflictAudit?.auditHash ||
        a.p.packageHash !== p.packageHash
      )
        return false;
      const review = await check(a, row);
      const options = {
        contextConflictAudit: row.audit,
        ...(review ? { contextConflictAuditReview: review } : {}),
      };
      return (
        canonicalGraphContext(options) === canonicalGraphContext(value.options) &&
        contextArchiveHash(options) === value.attachmentsHash
      );
    },
  };
  return { ...service, attachments, liveAcceptance: false as const };
}
export type ContextAuditArchiveService = ReturnType<typeof createContextAuditArchiveService>;
