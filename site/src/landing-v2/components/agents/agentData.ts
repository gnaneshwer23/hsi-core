import { agents as siteAgents, type Status } from "../../lib/site-data";

/**
 * Illustrative description of how specialised agents are designed to hand work to one another and be checked.
 * It describes intended roles and boundaries, not running behaviour; statuses come from the site's own agent list.
 * The example claims in the traces are generic and invented; they are not outputs.
 */
export type AgentLane = "produce" | "check";
export type AgentSpec = {
  id: string;
  name: string;
  lane: AgentLane;
  x: number;
  y: number;
  takes: string;
  gives: string;
  checkedBy: string;
  limit: string;
};
export const BOARD = { w: 1100, h: 440, nodeW: 176, nodeH: 66 } as const;


const raw: (Omit<AgentSpec, "name"> & { name: string })[] = [
  { id: "lit", name: "Literature Synthesis", lane: "produce", x: 170, y: 40, takes: "A research question and its scope.", gives: "Passage-level cited evidence, with source, version and section.", checkedBy: "Evidence Verification", limit: "Retrieves only from authorised sources and does not rank claims as true." },
  { id: "omics", name: "Multi-omics Correlation", lane: "produce", x: 170, y: 320, takes: "Authorised omics datasets and a question.", gives: "Cross-layer association candidates with the data they rest on.", checkedBy: "Evidence Verification, then expert review", limit: "Reports associations only; never causal claims." },
  { id: "verify", name: "Evidence Verification", lane: "check", x: 380, y: 180, takes: "Cited claims and their passages.", gives: "A status per claim (supported, not supported, insufficient) and retraction flags.", checkedBy: "A human reviewer on disputed or sampled claims", limit: "Cannot verify a claim whose source passage is missing, and does not judge significance." },
  { id: "contra", name: "Contradiction Detection", lane: "check", x: 640, y: 180, takes: "Verified claims with their experimental context.", gives: "A conflict set with candidate explanatory variables and stated uncertainty.", checkedBy: "Expert review", limit: "Treats disagreement as a lead to investigate, not proof that studies contradict." },
  { id: "hyp", name: "Hypothesis Generation", lane: "produce", x: 640, y: 40, takes: "Gaps and conflicts.", gives: "Testable hypotheses, each with its uncertainty and what would falsify it.", checkedBy: "Expert review", limit: "Proposals only; never presented as findings or recommendations." },
  { id: "design", name: "Experimental Design", lane: "produce", x: 850, y: 40, takes: "A hypothesis.", gives: "Draft experiment options with controls and readouts.", checkedBy: "Expert review", limit: "Drafts for expert consideration; no protocol is issued." },
];
export const AGENTS: (AgentSpec & { status: Status })[] = raw.map((a) => ({ ...a, status: siteAgents.find((s) => s.name === a.name)?.status ?? "Planned" }));
export const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<string, (typeof AGENTS)[number]>;

export const QUESTION = { id: "q", name: "Research question", x: 10, y: 180, w: 120, h: BOARD.nodeH };
export const HUMAN = { id: "human", name: "Expert review", x: 960, y: 180, w: 130, h: BOARD.nodeH };

export type Flow = { id: string; from: string; to: string; label: string; kind?: "handoff" | "return" };
export const FLOWS: Flow[] = [
  { id: "q-lit", from: "q", to: "lit", label: "question" },
  { id: "lit-ver", from: "lit", to: "verify", label: "cited claims" },
  { id: "om-ver", from: "omics", to: "verify", label: "associations" },
  { id: "ver-con", from: "verify", to: "contra", label: "verified" },
  { id: "con-hyp", from: "contra", to: "hyp", label: "conflicts, gaps" },
  { id: "hyp-des", from: "hyp", to: "design", label: "hypotheses" },
  { id: "des-hum", from: "design", to: "human", label: "draft options" },
  { id: "con-hum", from: "contra", to: "human", label: "conflict set" },
  { id: "ver-lit", from: "verify", to: "lit", label: "returned + reason", kind: "return" },
  { id: "con-ver", from: "contra", to: "verify", label: "unclear context", kind: "return" },
];

export type TraceStep = { at: string; flow?: string; note: string };
export type Trace = { id: string; name: string; claim: string; outcome: "passed" | "returned" | "flagged"; outcomeText: string; steps: TraceStep[] };
export const TRACES: Trace[] = [
  {
    id: "holds",
    name: "A claim that holds",
    claim: "“Intervention X lowers marker Y in model Z.”",
    outcome: "passed",
    outcomeText: "Reaches review with its evidence and the search scope stated.",
    steps: [
      { at: "q", note: "The question and its scope are fixed before any retrieval." },
      { at: "lit", flow: "q-lit", note: "Retrieves passages that state the claim, with source, version and section." },
      { at: "verify", flow: "lit-ver", note: "Checks that each passage supports the wording, and that no source is retracted or corrected." },
      { at: "contra", flow: "ver-con", note: "Finds no conflicting study in the sources searched, and reports the search scope rather than claiming none exists." },
      { at: "human", flow: "con-hum", note: "A reviewer records a decision and the reason for it." },
    ],
  },
  {
    id: "returned",
    name: "A claim returned for missing support",
    claim: "“Intervention X lowers marker Y in humans.”",
    outcome: "returned",
    outcomeText: "Stays out of the output until support is found.",
    steps: [
      { at: "q", note: "The question asks about humans." },
      { at: "lit", flow: "q-lit", note: "Retrieves passages; the closest ones report the effect in mice only." },
      { at: "verify", flow: "lit-ver", note: "No passage states the claim for humans, so the claim is marked not supported." },
      { at: "lit", flow: "ver-lit", note: "Returned to Literature Synthesis with the reason, to look for human evidence or state that there is none." },
    ],
  },
  {
    id: "conflict",
    name: "A conflict kept visible",
    claim: "“Intervention X lowers marker Y.”",
    outcome: "flagged",
    outcomeText: "Reaches review as an unresolved conflict with candidate explanations.",
    steps: [
      { at: "lit", flow: "q-lit", note: "Retrieves studies that report lowering, no effect and an increase." },
      { at: "verify", flow: "lit-ver", note: "Each study's passage supports its own reported result, so none is discarded." },
      { at: "contra", flow: "ver-con", note: "Aligns the studies by context and lists candidate explanatory variables, such as dose and timing." },
      { at: "hyp", flow: "con-hyp", note: "Proposes a testable hypothesis about the variable, with what would falsify it." },
      { at: "human", flow: "con-hum", note: "A reviewer decides whether the conflict is real, explained, or needs new data." },
    ],
  },
];
