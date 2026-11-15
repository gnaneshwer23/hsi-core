/**
 * Rubric for rating research-gap outputs. Four separate dimensions with anchored 1 to 5 levels. They are never added into one
 * score: a gap can be relevant but already well known, or novel but untestable, and the analysis reports each dimension alone.
 */
export const SCALE=[1,2,3,4,5] as const;
export type Score=1|2|3|4|5;
export type DimensionId="relevance"|"specificity"|"novelty"|"accuracy";
export type Dimension={id:DimensionId;label:string;question:string;anchors:{1:string;3:string;5:string}};
export const DIMENSIONS:readonly Dimension[]=[
 {id:"relevance",label:"Relevance",question:"Would this matter to a researcher working in this area?",anchors:{1:"Not relevant to the area, or trivial.",3:"Relevant but peripheral, or of narrow interest.",5:"Clearly central to current work in the area."}},
 {id:"specificity",label:"Specificity and testability",question:"Could an identifiable study or dataset address it?",anchors:{1:"Too vague to act on.",3:"Direction is clear but the study is not.",5:"A concrete, feasible study could address it."}},
 {id:"novelty",label:"Novelty",question:"Is it a question you would not already consider answered or well known?",anchors:{1:"Already well known or answered.",3:"Known to specialists, not settled.",5:"Genuinely open and not widely discussed."}},
 {id:"accuracy",label:"Accuracy of what it says is missing",question:"Does the stated missing evidence match what you know of the literature?",anchors:{1:"Wrong: the evidence exists or the claim is false.",3:"Partly right, or you cannot tell.",5:"Right: the evidence really is missing."}},
];
export const DIMENSION_IDS=DIMENSIONS.map(d=>d.id) as DimensionId[];
export const isScore=(v:unknown):v is Score=>typeof v==="number"&&Number.isInteger(v)&&v>=1&&v<=5;
export const RUBRIC_VERSION="hsi-gap-rubric-1" as const;
