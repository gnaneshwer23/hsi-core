import {InvestigationFlowDiagram} from "./InvestigationFlowDiagram";
import {PLATFORM_PATH} from "./flowSteps";

type Props = {
  ariaLabel?: string;
};

/** Four-stage example investigation — Connect, Verify, Reason, Collaborate. */
export function PlatformPathFlow({
  ariaLabel = "Example investigation",
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
