/** Spec investigation outputs 01–06 — shared chrome for decision workbench + outcome panel. */
export const INVESTIGATION_SECTIONS = [
  {
    id: "01",
    anchor: "inv-01",
    short: "Landscape",
    title: "Scientific landscape",
    detail: "Immune-cell involvement, mechanisms and therapies from the bound release — not a new synthesis.",
  },
  {
    id: "02",
    anchor: "inv-02",
    short: "Evidence",
    title: "Evidence comparison",
    detail: "Support and oppose traces keep biological context; empty oppose is not consensus.",
  },
  {
    id: "03",
    anchor: "inv-03",
    short: "Gaps",
    title: "Gap intelligence",
    detail: "Recorded missing evidence and uncertainty only — coverage gaps are not verified scientific gaps.",
  },
  {
    id: "04",
    anchor: "inv-04",
    short: "Translational",
    title: "Translational intelligence",
    detail: "Trials remain not_queried until a versioned registry snapshot is attached (step 05).",
  },
  {
    id: "05",
    anchor: "inv-05",
    short: "Action plan",
    title: "Research action plan",
    detail: "Falsification questions and next steps from the saved planner — no invented protocols.",
  },
  {
    id: "06",
    anchor: "inv-06",
    short: "Package",
    title: "Evidence package",
    detail: "Hashes, passages, sources and export. Live Ask→export completion stays parked on human #5.",
  },
] as const;

export type InvestigationSectionId = (typeof INVESTIGATION_SECTIONS)[number]["id"];
