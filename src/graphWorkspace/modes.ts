/**
 * LEA-04B: the twelve graph modes as data over one engine. A mode chooses which assertions are in view, how they are
 * encoded, which filters and inspector sections apply, and which actions are offered. Readiness is reported from the
 * data that exists today (see the LEA-04A audit), and a mode that lacks data says so instead of drawing something.
 */
export type ModeId="atlas"|"mechanism"|"evidence"|"contradiction"|"temporal"|"memory"|"gap"|"hypothesis"|"experimental"|"multiomics"|"translational"|"collaboration";
export type Readiness="ready"|"partial"|"minimal"|"none"|"blocked";
export type NodeEncoding="domain"|"kind"|"evidence_model"|"context_completeness";
export type EdgeEncoding="reported_predicate"|"negation"|"context_conflict"|"evidence_basis";
export type EdgeSelection="all"|"negated"|"context_gaps"|"comparable_pairs"|"gap_records"|"question_paths";
export type InspectorSection="overview"|"identifiers"|"claims"|"context"|"evidence"|"conflicts"|"review"|"memory"|"gaps";
export type FilterKey="query"|"domains"|"kinds"|"predicates"|"species"|"models"|"minContext"|"negated"|"scales";

export type GraphMode={
 id:ModeId;label:string;summary:string;
 readiness:Readiness;readinessNote:string;
 select:EdgeSelection;nodeEncoding:NodeEncoding;edgeEncoding:EdgeEncoding;
 filters:readonly FilterKey[];inspector:readonly InspectorSection[];actions:readonly string[];
 /** What a mode needs before it can leave its current readiness. */
 needs?:string;
};

const F:readonly FilterKey[]=["query","domains","kinds","predicates","species","models","minContext","negated","scales"];
const INS_ALL:readonly InspectorSection[]=["overview","identifiers","claims","context","evidence","conflicts","review","memory","gaps"];

export const MODES:readonly GraphMode[]=[
 {id:"atlas",label:"Biological Atlas",summary:"Concepts by domain and kind.",readiness:"ready",readinessNote:"157 concepts in the published graph.",select:"all",nodeEncoding:"domain",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus","expand","trace"]},
 {id:"mechanism",label:"Mechanism Graph",summary:"Reported relationships and the paths between concepts. Association, not established mechanism.",readiness:"ready",readinessNote:"Paths are association chains.",select:"all",nodeEncoding:"kind",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus","expand","trace","compare"]},
 {id:"evidence",label:"Evidence Graph",summary:"Relationships by evidence model and how much context is stated.",readiness:"ready",readinessNote:"No relationship is reviewed or calibrated.",select:"all",nodeEncoding:"evidence_model",edgeEncoding:"evidence_basis",filters:F,inspector:INS_ALL,actions:["focus","expand","compare"]},
 {id:"contradiction",label:"Contradiction Graph",summary:"Where findings on the same concepts may disagree, and whether their contexts differ.",readiness:"ready",readinessNote:"Disagreements come from the existing context classifier (same context, across contexts, context not stated). None is resolved or adjudicated.",select:"comparable_pairs",nodeEncoding:"kind",edgeEncoding:"context_conflict",filters:F,inspector:INS_ALL,actions:["focus","compare"]},
 {id:"temporal",label:"Temporal Graph",summary:"The graph across published versions.",readiness:"partial",readinessNote:"Versions are pinned by digest with a parent pointer; individual assertions carry no validity interval.",select:"all",nodeEncoding:"domain",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus"],needs:"Per-assertion version history and validity intervals."},
 {id:"memory",label:"Scientific Memory Graph",summary:"Your investigations and decisions around the graph.",readiness:"partial",readinessNote:"Investigations follow the one-store shape (ADR-012). They are kept in this browser until the account store is switched on after the database review.",select:"all",nodeEncoding:"domain",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus"],needs:"The account store (migration 034) applied after the independent database review."},
 {id:"gap",label:"Research Gap Graph",summary:"Recorded gaps: what the sources do not yet answer.",readiness:"ready",readinessNote:"Gaps are recorded as gaps, never as findings.",select:"gap_records",nodeEncoding:"domain",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus","expand"]},
 {id:"hypothesis",label:"Hypothesis Graph",summary:"Recorded questions with a prediction and a falsifier.",readiness:"ready",readinessNote:"Candidate questions, not validated hypotheses.",select:"question_paths",nodeEncoding:"kind",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus","trace"]},
 {id:"experimental",label:"Experimental Graph",summary:"Candidate experiments and controls attached to recorded questions.",readiness:"partial",readinessNote:"Candidate designs only; never validated protocols.",select:"question_paths",nodeEncoding:"kind",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus"],needs:"Reviewed experimental designs."},
 {id:"multiomics",label:"Multi-omics Graph",summary:"Genomic, transcriptomic and proteomic layers.",readiness:"none",readinessNote:"The published graph has no genomics or multi-omics coverage.",select:"all",nodeEncoding:"kind",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:[],needs:"Multi-omics sources and ontology mappings."},
 {id:"translational",label:"Translational Graph",summary:"Trials and interventions linked to mechanisms.",readiness:"minimal",readinessNote:"Only a handful of trial and intervention concepts exist.",select:"all",nodeEncoding:"kind",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus"],needs:"Trial sources beyond the current four concepts."},
 {id:"collaboration",label:"Collaboration Graph",summary:"Authorised research groups and shared investigations.",readiness:"partial",readinessNote:"Scope registry and verified membership are designed and tested (ADR-013, ADR-014). Sharing needs a signed-in account and the account store, which switches on after the database review.",select:"all",nodeEncoding:"domain",edgeEncoding:"reported_predicate",filters:F,inspector:INS_ALL,actions:["focus"],needs:"The account store (migration 034) applied after the independent database review."},
];
export const modeById=Object.fromEntries(MODES.map(m=>[m.id,m])) as Record<ModeId,GraphMode>;
/** A mode with no data or blocked by a decision is listed but cannot be opened. */
export const isOpenable=(m:GraphMode)=>m.readiness==="ready"||m.readiness==="partial"||m.readiness==="minimal";
export const openableModes=()=>MODES.filter(isOpenable);
export const READINESS_LABEL:Record<Readiness,string>={ready:"Ready",partial:"Partial",minimal:"Minimal data",none:"No data yet",blocked:"Blocked"};
