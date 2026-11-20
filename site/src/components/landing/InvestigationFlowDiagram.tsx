import type {CSSProperties} from "react";
import type {FlowStep} from "./flowSteps";
import {INVESTIGATION_FLOW} from "./flowSteps";

type Props = {
  steps?: readonly FlowStep[];
  ariaLabel?: string;
  emphasizeId?: string;
  size?: "lg" | "sm";
  className?: string;
};

/**
 * Process infographic: numbered steps on a single connector spine.
 * Flat on page ground — no cards, tiles, or layered chrome.
 * Horizontal on desktop, vertical on narrow viewports. Reduced-motion safe.
 */
export function InvestigationFlowDiagram({
  steps = INVESTIGATION_FLOW,
  ariaLabel = "Investigation flow: question to brief",
  emphasizeId,
  size = "lg",
  className,
}: Props) {
  const ids = steps.map((s) => s.id).join("-");
  const titleId = `flow-title-${ids}`;
  const descId = `flow-desc-${ids}`;
  const summary = steps.map((s, i) => `${i + 1}. ${s.label}: ${s.line}`).join(" ");

  return (
    <figure
      className={`ld-flow${size === "sm" ? " ld-flow-sm" : ""}${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <figcaption id={titleId} className="ld-flow-caption">
        {ariaLabel}
      </figcaption>
      <p id={descId} className="ld-flow-sr">
        {summary}
      </p>

      <div className="ld-flow-figure">
        <svg
          className="ld-flow-spine ld-flow-spine-h"
          viewBox="0 0 1000 24"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            className="ld-flow-path"
            d="M40 12 H960"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
        <svg
          className="ld-flow-spine ld-flow-spine-v"
          viewBox="0 0 24 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            className="ld-flow-path"
            d="M12 28 V972"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>

        <ol className="ld-flow-track" aria-label={ariaLabel}>
          {steps.map((step, i) => {
            const n = String(i + 1).padStart(2, "0");
            const on = emphasizeId === step.id;
            return (
              <li
                key={step.id}
                className={`ld-flow-node${on ? " is-emphasis" : ""}`}
                data-step={step.id}
                style={{"--ld-i": i} as CSSProperties}
              >
                <span className="ld-flow-n" aria-hidden="true">
                  {n}
                </span>
                <span className="ld-flow-label">{step.label}</span>
                <span className="ld-flow-line">{step.line}</span>
                {i < steps.length - 1 ? (
                  <span className="ld-flow-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 12" width="22" height="11" focusable="false">
                      <path
                        d="M0 6h16M12 1l8 5-8 5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}
