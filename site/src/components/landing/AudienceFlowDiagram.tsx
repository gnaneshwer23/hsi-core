import {InvestigationFlowDiagram} from "./InvestigationFlowDiagram";
import {AUDIENCE_FLOWS, type AudienceFlowVariant} from "./flowSteps";
import {LandingMaturityLabel, type LandingMaturityLevel} from "./LandingPrimitives";

type Cap = {
  title: string;
  maturity: LandingMaturityLevel;
};

type Props = {
  variant: AudienceFlowVariant;
  /** Compact maturity chips — titles only, no essay bodies. */
  capabilities?: readonly Cap[];
  ariaLabel?: string;
};

/** Role-specific flow diagram plus optional maturity chip row. */
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
        <ul className="ld-maturity-chips" aria-label="Capability maturity">
          {capabilities.map((c) => (
            <li key={c.title}>
              <LandingMaturityLabel level={c.maturity} />
              <span>{c.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
