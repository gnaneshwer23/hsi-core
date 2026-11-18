/**
 * Conflict classification for one context breakdown. It separates three situations that a pooled count hides:
 * records that disagree inside one context, records that disagree only across different contexts, and records that
 * disagree but do not state enough context to tell which. It reports what is recorded. It never says which side is
 * right, never calls a conflict resolved, and never turns a context difference into an explanation.
 */
import type {ContextBreakdown,Stratum} from "./contextBreakdown";

export type ConflictClass=
 | "no_disagreement"                 // every record reports in one direction (or there is a single record)
 | "same_context_disagreement"       // a single context holds both reported and negative findings
 | "context_separated_disagreement"  // directions differ only across contexts, each context internally consistent and fully stated
 | "disagreement_context_unknown";   // directions differ, but a disagreeing context omits its study system or design

export type ConflictAssessment={
 schemaVersion:"hsi-context-conflict-1";
 classification:ConflictClass;
 /** Contexts on each side of the disagreement, by stratum index in the breakdown. Empty when there is none. */
 sides:{reported:number[];negative:number[];mixed:number[]};
 statement:string;
 limits:string[];
 adjudication:"not_performed";
 scientificApproval:false;causalConclusionAllowed:false;
};

const LIMITS=Object.freeze([
 "This sorts recorded findings by context. It does not decide which finding is correct.",
 "Direction is read from a negation flag on each candidate record, not from effect sizes or statistics.",
 "Every record is an unreviewed candidate; a reviewer has not checked that any two records address the same question.",
]);
const idx=(strata:readonly Stratum[],pick:(s:Stratum)=>boolean)=>strata.flatMap((s,i)=>pick(s)?[i]:[]);
const unclear=(s:Stratum)=>s.missingFields.includes("model")||s.missingFields.includes("design");

export function assessConflict(b:ContextBreakdown):ConflictAssessment{
 const strata=b.strata,mixed=idx(strata,s=>s.direction==="mixed"),neg=idx(strata,s=>s.direction==="negative"),rep=idx(strata,s=>s.direction==="reported");
 const sides={reported:rep,negative:neg,mixed};
 const base={schemaVersion:"hsi-context-conflict-1" as const,sides,limits:[...LIMITS],adjudication:"not_performed" as const,scientificApproval:false as const,causalConclusionAllowed:false as const};
 if(b.totals.records===0)return {...base,classification:"no_disagreement",statement:"No source-linked candidate records, so nothing can be compared."};
 const disagree=mixed.length>0||(rep.length>0&&neg.length>0);
 if(!disagree)return {...base,classification:"no_disagreement",statement:b.totals.records===1?"One record. Nothing to compare yet.":"The recorded findings point one way. That is not confirmation: they may share a cohort or a context."};
 const sidesTouched=[...rep,...neg,...mixed];
 if(sidesTouched.some(i=>unclear(strata[i]!))){
  return {...base,classification:"disagreement_context_unknown",statement:"Findings differ in direction, but at least one disagreeing context does not state its study system or design, so a difference in context cannot be told from a real conflict."};
 }
 if(mixed.length>0){
  return {...base,classification:"same_context_disagreement",statement:`${mixed.length===1?"One fully stated context holds":`${mixed.length} fully stated contexts each hold`} both a reported and a negative finding. This is a candidate for a genuine conflict and needs expert reading of the sources.`};
 }
 return {...base,classification:"context_separated_disagreement",statement:"Findings differ in direction only between contexts, and each context is internally consistent. The difference may reflect context. It has not been explained or adjudicated."};
}

/**
 * Plain-language labels for Evidence-by-context surfaces.
 * Same / across / unknown — never “resolved”.
 */
export const CONFLICT_LABEL:Readonly<Record<ConflictClass,string>>=Object.freeze({
 no_disagreement:"No disagreement",
 same_context_disagreement:"Same context",
 context_separated_disagreement:"Across contexts",
 disagreement_context_unknown:"Unknown context",
});

/** Longer clarifying phrase kept for export and assistive copy. */
export const CONFLICT_LABEL_DETAIL:Readonly<Record<ConflictClass,string>>=Object.freeze({
 no_disagreement:"No disagreement recorded among these candidates",
 same_context_disagreement:"Disagreement inside a fully stated context that holds both directions",
 context_separated_disagreement:"Disagreement only across different fully stated contexts",
 disagreement_context_unknown:"Disagreement where at least one side lacks a stated study system or design",
});
