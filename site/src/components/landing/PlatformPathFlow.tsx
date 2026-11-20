import {PLATFORM_PATH} from "./flowSteps";

type Props = {
  ariaLabel?: string;
};

/**
 * Eight-step platform path: horizontal rail on desktop, vertical stack on mobile.
 */
export function PlatformPathFlow({
  ariaLabel = "Platform workflow stages",
}: Props) {
  const summary = PLATFORM_PATH.map((s, i) => `${i + 1}. ${s.label}: ${s.line}`).join(" ");

  return (
    <figure className="ld-path" aria-labelledby="ld-path-title" aria-describedby="ld-path-desc">
      <figcaption id="ld-path-title" className="ld-flow-caption">
        The scientific investigation path
      </figcaption>
      <p id="ld-path-desc" className="ld-flow-sr">
        {summary}
      </p>
      <ol className="ld-path-track" aria-label={ariaLabel}>
        {PLATFORM_PATH.map((step, i) => (
          <li key={step.id} data-step={step.id}>
            <span className="ld-path-n" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ld-path-label">{step.label}</span>
            <span className="ld-path-line">{step.line}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
