import { describe, expect, it } from "bun:test";
import {
  buildSyntheticFhirMappingNotes,
  EVENT_KIND_TO_FHIR,
  mapTimelineEventToFhirNote,
  PROVIDER_TO_FHIR_SYSTEM,
} from "../src/clinicalSyntheticFhirNotes";
import {
  buildClinicalTimelineView,
  listSyntheticTimelineFixtures,
} from "../src/clinicalSyntheticTimeline";

describe("Clinical synthetic FHIR mapping notes", () => {
  it("builds illustrative R4 hints for every synthetic fixture", () => {
    for (const f of listSyntheticTimelineFixtures()) {
      const notes = buildSyntheticFhirMappingNotes(f.fixtureId);
      expect(notes).not.toBeNull();
      if (!notes) continue;
      expect(notes.syntheticOnly).toBe(true);
      expect(notes.liveEmis).toBe(false);
      expect(notes.fhirSoT).toBe(false);
      expect(notes.ukCoreCertified).toBe(false);
      expect(notes.smartOnFhir).toBe(false);
      expect(notes.containsPhi).toBe(false);
      expect(notes.events.length).toBe(f.events.length);
      expect(notes.honesty.some((h) => /not a FHIR System of Record/i.test(h))).toBe(true);
      for (const e of notes.events) {
        expect(EVENT_KIND_TO_FHIR[e.kind].resourceType).toBe(e.resourceType);
        expect(e.illustrativeSystem.startsWith("urn:hsi:fixture:")).toBe(true);
      }
    }
  });

  it("maps event kinds to Encounter / Observation / MedicationStatement / Condition", () => {
    expect(EVENT_KIND_TO_FHIR.encounter.resourceType).toBe("Encounter");
    expect(EVENT_KIND_TO_FHIR.lab.resourceType).toBe("Observation");
    expect(EVENT_KIND_TO_FHIR.vital.resourceType).toBe("Observation");
    expect(EVENT_KIND_TO_FHIR.medication.resourceType).toBe("MedicationStatement");
    expect(EVENT_KIND_TO_FHIR.problem.resourceType).toBe("Condition");
    expect(PROVIDER_TO_FHIR_SYSTEM.synthetic_gp.illustrativeSystem).toContain("gp");
  });

  it("aligns notes with Cap 9 timeline view for T2D fixture", () => {
    const view = buildClinicalTimelineView("syn-t2d-multi-provider-01");
    const notes = buildSyntheticFhirMappingNotes("syn-t2d-multi-provider-01");
    expect(view).not.toBeNull();
    expect(notes).not.toBeNull();
    if (!view || !notes) return;
    expect(notes.events.map((e) => e.eventId).sort()).toEqual(
      view.events.map((e) => e.id).sort(),
    );
    const lab = view.events.find((e) => e.kind === "lab");
    expect(lab).toBeTruthy();
    if (!lab) return;
    const mapped = mapTimelineEventToFhirNote(lab);
    expect(mapped.resourceType).toBe("Observation");
    expect(mapped.illustrativeSystem).toBe("urn:hsi:fixture:lab");
  });

  it("fail-closes unknown fixture ids", () => {
    expect(buildSyntheticFhirMappingNotes("not-a-fixture")).toBeNull();
  });
});
