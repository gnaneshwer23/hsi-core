import { readResearchOutcomeResponse } from '../lib/researchOutcomeClient';
import { useEffect, useState } from 'react';
import { deliveryDigest } from '../lib/investigationDeliveryClient';
import { canonicalGraphContext } from '../../../src/investigationGraphContext';
import type { ContextConflictAudit } from '../../../src/evidence/contextConflictAudit';
import type { ContextAuditReviewRequest } from '../../../src/evidence/contextAuditReview';

/** Capabilities come from the authenticated backend; identities and scopes are never posted. */
export function ContextAuditReviewPanel({
  investigationId,
  packageHash,
  audit,
  onReviewed,
}: {
  investigationId: string;
  packageHash: string;
  audit: ContextConflictAudit;
  onReviewed: () => void;
}) {
  const [allowed, setAllowed] = useState(false),
    [message, setMessage] = useState('Checking independent audit-review access…'),
    [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<ContextAuditReviewRequest['decision']>('needs_evidence'),
    [rationale, setRationale] = useState(''),
    [limitations, setLimitations] = useState(''),
    [declared, setDeclared] = useState(false);
  const [retry, setRetry] = useState<{ key: string; requestId: string } | null>(null);
  const base = '/api/research/interrogative/' + encodeURIComponent(investigationId);
  useEffect(() => {
    const c = new AbortController(),
      timer = setTimeout(() => c.abort(), 20000);
    setAllowed(false);
    fetch(base + '/context-audit', {
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      signal: c.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (r) => {
        const text = await readResearchOutcomeResponse(r);
        const view = JSON.parse(text),
          row = view.artifact;
        if (
          !row ||
          row.audit.auditHash !== audit.auditHash ||
          row.binding.investigationId !== investigationId ||
          row.binding.packageHash !== packageHash ||
          typeof view.canReview !== 'boolean'
        )
          throw Error();
        const { archiveHash, ...body } = row;
        if ((await deliveryDigest(canonicalGraphContext(body))) !== archiveHash) throw Error();
        if (!c.signal.aborted) {
          setAllowed(view.canReview);
          setMessage(
            view.canReview
              ? 'Independent audit assessment is available for this exact version.'
              : view.review
                ? 'This audit version already has a recorded assessment.'
                : 'Only an independent reviewer with a current grant for this tenant and disease can assess this audit.',
          );
        }
      })
      .catch(() => {
        if (!c.signal.aborted)
          setMessage(
            'Audit-review access is unavailable or has changed. No review authority is inferred.',
          );
      })
      .finally(() => clearTimeout(timer));
    return () => {
      c.abort();
      clearTimeout(timer);
    };
  }, [base, packageHash, audit.auditHash]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allowed || busy || !declared) return;
    setBusy(true);
    setMessage('Recording this audit assessment…');
    const fields = {
      auditHash: audit.auditHash,
      decision,
      rationale,
      limitations: limitations
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      conflictOfInterestDeclared: true as const,
    };
    const key = JSON.stringify(fields),
      requestId = retry?.key === key ? retry.requestId : crypto.randomUUID();
    setRetry({ key, requestId });
    try {
      const r = await fetch(base + '/context-audit-review', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...fields, requestId }),
      });
      const saved = JSON.parse(await readResearchOutcomeResponse(r));
      if (
        saved.auditHash !== audit.auditHash ||
        saved.packageHash !== packageHash ||
        saved.scope !== 'context_audit_only' ||
        saved.scientificApproval !== false ||
        saved.graphPromotable !== false
      )
        throw Error();
      const { decisionHash, id, ...body } = saved;
      if (
        (await deliveryDigest(canonicalGraphContext(body))) !== decisionHash ||
        id !== 'audit-review-' + decisionHash.slice(0, 32)
      )
        throw Error();
      setAllowed(false);
      setMessage(
        'This audit assessment was recorded. Scientific approval and graph publication remain separate.',
      );
      onReviewed();
    } catch {
      setMessage(
        'The assessment could not be confirmed. Retry unchanged inputs to retain the same request ID, or refresh to check the current audit.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="context-audit-review" aria-label="Independent context-audit assessment">
      <h4>Assess this audit version</h4>
      <p role="status">{message}</p>
      {allowed && (
        <form onSubmit={submit}>
          <label>
            Audit assessment
            <select
              aria-label="Audit assessment"
              value={decision}
              onChange={(e) => setDecision(e.target.value as ContextAuditReviewRequest['decision'])}
            >
              <option value="needs_evidence">Needs evidence</option>
              <option value="reject">Reject</option>
              <option value="accept_with_limitations">Accept with limitations</option>
            </select>
          </label>
          <label>
            Audit scientific rationale
            <textarea
              required
              maxLength={4000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <label>
            Assessment limitations, one per line
            <textarea
              required={decision === 'accept_with_limitations'}
              maxLength={12000}
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
            />
            I have declared relevant conflicts of interest.
          </label>
          <button type="submit" disabled={busy || !declared}>
            Record independent audit assessment
          </button>
        </form>
      )}
    </section>
  );
}
