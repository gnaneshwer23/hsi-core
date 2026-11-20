import {InvestigationFlowDiagram} from "./InvestigationFlowDiagram";
import {AUDIENCE_FLOWS, type AudienceFlowVariant} from "./flowSteps";
import {LandingMaturityLabel, type LandingMaturityLevel} from "./LandingPrimitives";

type Cap = {
  title: string;
  maturity: LandingMaturityLevel;
};

type Props = {
  variant: AudienceFlowVariant;
  /** Compact maturity footnote — inline text, not chip cards. */
  capabilities?: readonly Cap[];
  ariaLabel?: string;
};

/** Role-specific process infographic plus optional maturity footnote strip. */
export function AudienceFlowDiagram({variant, capabilities, ariaLabel}: Props) {
  const steps = AUDIENCE_FLOWS[variant];
  return (
    <div className="ld-audience-flow">
      <InvestigationFlowDiagram
        steps={steps}
        size="sm"
        ariaLabel={ariaLabel ?? `${variant} investigation flow`}
      />
      {capabilities && capabilities.length > 0 ? (
        <p className="ld-maturity-note" role="note" aria-label="Capability maturity">
          {capabilities.map((c, i) => (
            <span key={c.title} className="ld-maturity-item">
              {i > 0 ? <span className="ld-maturity-sep" aria-hidden="true"> · </span> : null}
              <LandingMaturityLabel level={c.maturity} />
              <span className="ld-maturity-title">{c.title}</span>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
