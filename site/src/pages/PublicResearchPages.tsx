import {
  AUDIT_TEACHING_OUTCOMES,
  ContextAuditInstrument,
  GovernanceChain,
  PublicAction,
  PublicHero,
  PublicSection,
} from "../components/public/ResearchPublic";
export function ContextConflictAuditPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="Different findings. Deeper understanding."
        description="Investigate whether research findings genuinely contradict each other, differ by context or remain unresolved."
      >
        <div className="hsi-actions">
          <PublicAction to="/context-conflict-audit#explore-audit">Explore an Audit</PublicAction>
          <PublicAction to="/research/workspace" secondary>
            Open the investigation workspace
          </PublicAction>
        </div>
      </PublicHero>
      <PublicSection
        id="explore-audit"
        title="Compare the conditions before the conclusions."
        description="Different experimental systems can answer different questions. Select study context and inspect how the illustrative relationship changes."
      >
        <ContextAuditInstrument id="flagship-audit" />
      </PublicSection>
      <PublicSection
        title="Five teaching outcomes. One obligation to preserve uncertainty."
        description="The labels below describe possible research interpretations. They are not an automated validation service."
      >
        <div className="hsi-outcome-list">
          {AUDIT_TEACHING_OUTCOMES.map((name, n) => (
            <article key={name}>
              <h3>{name}</h3>
              <p>
                {
                  [
                    "Opposing findings on the same estimand require evidence that comparability, study quality and alternative explanations have been independently examined. The public example only stipulates this in fiction.",
                    "Tissue, cell state, stage, dose or time can change interpretation. A difference in context does not by itself explain causality.",
                    "A missing passage, unresolved identifier or absent experimental detail constrains the answer. Abstention can be the correct research outcome.",
                    "Apparently comparable results still need uncertainty, bias, controls and independent scrutiny. Model agreement is not the resolution.",
                    "Different species, methods or outcomes may not address the same question. Align the estimand before comparing polarity.",
                  ][n]
                }
              </p>
            </article>
          ))}
        </div>
        <p>
          Internal scientific reporting retains its separate consistent, potential-conflict,
          context-dependent, methodological-difference and insufficient-evidence states. This public teaching
          view does not rename them or upgrade potential conflict into proven contradiction.
        </p>
      </PublicSection>
      <PublicSection
        title="A comparison should lead to a reviewable decision."
        description="Keep source versions, experimental context, unresolved explanations and the next evidence needed together."
        dark
      >
        <GovernanceChain />
        <div className="hsi-actions">
          <PublicAction to="/research/workspace">Open the investigation workspace</PublicAction>
          <PublicAction to="/trust" secondary>
            Understand Scientific Governance
          </PublicAction>
        </div>
        <p>
          Public demonstrations make no live model calls. Authorised research execution, source clearance and
          independent acceptance remain restricted.
        </p>
      </PublicSection>
    </div>
  );
}
