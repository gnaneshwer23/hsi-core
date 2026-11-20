import {InvestigationFlowDiagram} from "./InvestigationFlowDiagram";
import {PLATFORM_PATH} from "./flowSteps";

type Props = {
  ariaLabel?: string;
};

/** Eight-step platform path — same process-infographic vocabulary as Home. */
export function PlatformPathFlow({
  ariaLabel = "Platform workflow stages",
}: Props) {
  return (
    <InvestigationFlowDiagram
      steps={PLATFORM_PATH}
      ariaLabel={ariaLabel}
      size="lg"
      className="ld-path"
    />
  );
}
