import { describe, expect, test } from "bun:test";
import {
  IMMUNE_CELL_SPINE_NODES,
  P20_CURATOR_CONFIRMED_SPINE_IDS,
  P20_ONTOLOGY_BIND_REVIEW,
  SSC_NEIGHBOURHOOD_CARDS,
  buildImmuneCellSpineBundle,
  countSpineOntologyHints,
  getPartnerLock,
} from "../src/index";

describe("P2.0 curator-confirmed CL/MONDO binds", () => {
  test("review metadata refuses Gate C / grade / CDS claims", () => {
    expect(P20_ONTOLOGY_BIND_REVIEW.doesNotSetHsiGrade).toBe(true);
    expect(P20_ONTOLOGY_BIND_REVIEW.notGateC).toBe(true);
    expect(P20_ONTOLOGY_BIND_REVIEW.notCds).toBe(true);
    expect(P20_ONTOLOGY_BIND_REVIEW.method).toBe(
      "ols_label_match_curator_review",
    );
    expect(P20_CURATOR_CONFIRMED_SPINE_IDS).toHaveLength(18);
  });

  test("confirmed spine ids match node statuses; ambiguous classes stay hint_only", () => {
    const counts = countSpineOntologyHints();
    expect(counts.confirmed).toBe(18);
    expect(counts.hinted).toBe(3);

    for (const id of P20_CURATOR_CONFIRMED_SPINE_IDS) {
      const n = IMMUNE_CELL_SPINE_NODES.find((x) => x.id === id);
      expect(n?.ontologyBindStatus).toBe("curator_confirmed");
      expect(n?.notes).toContain("P2.0 curator_confirmed");
    }

    for (const id of [
      "HSI-IC-class-myeloid",
      "HSI-IC-class-ilc",
      "HSI-IC-lin-mast",
    ]) {
      expect(
        IMMUNE_CELL_SPINE_NODES.find((n) => n.id === id)?.ontologyBindStatus,
      ).toBe("hint_only");
    }

    const bundle = buildImmuneCellSpineBundle();
    expect(bundle.ontologyBindReview.phase).toBe(
      "p2_0_curator_confirmed_cl_mondo",
    );
  });

  test("SSc core cards confirmed; RA Stage 1 lock untouched", () => {
    const confirmed = SSC_NEIGHBOURHOOD_CARDS.flatMap((c) =>
      c.ontologyHints.filter((h) => h.bindStatus === "curator_confirmed"),
    );
    expect(confirmed.some((h) => h.id === "CL:0002038")).toBe(true);
    expect(confirmed.some((h) => h.id === "CL:0000236")).toBe(true);
    expect(confirmed.some((h) => h.id === "CL:0000980")).toBe(true);
    expect(confirmed.some((h) => h.id === "MONDO:0005100")).toBe(true);

    const lock = getPartnerLock();
    expect(lock.disease?.id).toBe("ra");
    expect(lock.lockedPilot).toBe(true);
    expect(lock.scopeLocked).toBe(true);
  });
});
