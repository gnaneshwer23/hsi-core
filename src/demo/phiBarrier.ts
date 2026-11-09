/**
 * Private patient text must not enter the research graph.
 * The synthetic cohort uses project pseudonyms. A payload that carries a PHI marker is rejected.
 */
import { rejectPhiPayload } from "../cdsPhiBoundary";
import type { GraphRelease } from "./graphRelease";

export function assertPhiCannotEnterGraph(release: GraphRelease, textBlobs: readonly string[]): { blocked: true; reasons: string[] } {
  const decision = rejectPhiPayload({
    notCds: true,
    autoSurfaceCds: false,
    autoApproveIntoKg: false,
    containsPhi: false,
    mayUseLivePhi: false,
    clinicalActive: false,
    phiToLlm: false,
    textBlobs: [...textBlobs],
  });
  if (decision.ok) {
    throw new Error("PHI barrier did not reject a marked payload");
  }
  const serialised = JSON.stringify(release);
  for (const blob of textBlobs) {
    if (serialised.includes(blob)) throw new Error("Research graph release contains rejected patient text");
  }
  if (release.patientDataIncluded) throw new Error("Research graph release claims patient data was included");
  return { blocked: true, reasons: decision.reasons };
}
