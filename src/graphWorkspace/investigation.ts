/**
 * LEA-04H: research gap, hypothesis and experimental views over the published graph's recorded gaps and questions.
 * A recorded question is a candidate question, not a validated hypothesis. A recorded experiment is a candidate design,
 * never a protocol: it has not been reviewed, powered, costed or approved by an ethics body. A chain between a
 * question's two concepts is a sequence of reported associations, not evidence for the hypothesis.
 */
import type {DomainGap,DomainQuestion} from "../knowledgeGraph/domainGraph";
import type {GraphAssertionView,GraphModel} from "./assertionView";
import {tracePaths,type TracedPath} from "./slice";

export const CANDIDATE_QUESTION_NOTE="A candidate question recorded with the graph, not a validated hypothesis.";
export const CANDIDATE_DESIGN_NOTE="A candidate design, not a validated protocol. It has not been reviewed, powered, costed or approved by an ethics body.";
export const NEXT_STUDY_NOTE="A suggested next study is a candidate, not a protocol.";

export type GapView={
 id:string;question:string;missing:string;
 nextStudy:{text:string;status:"candidate";protocol:false};
 subjectId:string;objectId:string;conditions:readonly string[];
 /** Questions that cite this gap. */
 questionIds:string[];
 /** Candidate relationships touching either concept of the gap, over the whole graph. */
 relationships:number;
};

export function gapView(model:GraphModel,g:DomainGap):GapView{
 return {
  id:g.id,question:g.question,missing:g.missing,
  nextStudy:{text:g.nextStudy,status:"candidate",protocol:false},
  subjectId:g.subjectId,objectId:g.objectId,conditions:g.conditions,
  questionIds:model.questions.filter(q=>q.gapIds.includes(g.id)).map(q=>q.id),
  relationships:model.assertions.filter(a=>[a.subject.id,a.object.id].some(id=>id===g.subjectId||id===g.objectId)).length,
 };
}

export type QuestionView={
 id:string;title:string;summary:string;fromId:string;toId:string;conditions:readonly string[];
 hypothesis:{prediction:string;falsifier:string;status:"candidate_question";validated:false};
 experiment:{design:string;controls:readonly string[];status:"candidate_design";protocol:false};
 gaps:GapView[];
 /** Association chains between the two concepts over the given relationships. Empty means none in that set. */
 chains:TracedPath[];
 /** Whether the two concepts appear in the given relationships at all. */
 endpointsInView:{from:boolean;to:boolean};
};

export function questionView(model:GraphModel,q:DomainQuestion,within:readonly GraphAssertionView[]=model.assertions,maxHops=4):QuestionView{
 const ids=new Set(within.flatMap(a=>[a.subject.id,a.object.id]));
 return {
  id:q.id,title:q.title,summary:q.summary,fromId:q.fromId,toId:q.toId,conditions:q.conditions,
  hypothesis:{prediction:q.prediction,falsifier:q.falsifier,status:"candidate_question",validated:false},
  experiment:{design:q.experiment,controls:q.controls,status:"candidate_design",protocol:false},
  gaps:q.gapIds.map(id=>model.gaps.find(g=>g.id===id)).filter((g):g is DomainGap=>!!g).map(g=>gapView(model,g)),
  chains:tracePaths(within,q.fromId,q.toId,maxHops,3),
  endpointsInView:{from:ids.has(q.fromId),to:ids.has(q.toId)},
 };
}

/** Questions relevant to a view: those with either concept, or one of their gaps' concepts, among the given relationships. */
export function questionsInView(model:GraphModel,within:readonly GraphAssertionView[]):DomainQuestion[]{
 const ids=new Set(within.flatMap(a=>[a.subject.id,a.object.id]));
 return model.questions.filter(q=>ids.has(q.fromId)||ids.has(q.toId)||q.gapIds.some(gid=>{const g=model.gaps.find(x=>x.id===gid);return !!g&&(ids.has(g.subjectId)||ids.has(g.objectId))}));
}

/**
 * Relationships for the hypothesis and experimental modes: those on chains between each question's two concepts,
 * plus those touching either concept, so a question with no chain still shows what is recorded around it.
 */
export function questionPathAssertions(model:GraphModel,within:readonly GraphAssertionView[],questions:readonly DomainQuestion[]=questionsInView(model,within)):GraphAssertionView[]{
 const keep=new Set<string>();
 for(const q of questions){
  for(const c of tracePaths(within,q.fromId,q.toId,4,3))for(const id of c.assertionIds)keep.add(id);
  for(const a of within)if([a.subject.id,a.object.id].some(id=>id===q.fromId||id===q.toId))keep.add(a.id);
 }
 return within.filter(a=>keep.has(a.id));
}

/** The plain-text brief for a candidate experiment, carrying every caveat with it. */
export function experimentBrief(model:GraphModel,v:QuestionView):string{
 const name=(id:string)=>model.nodes.get(id)?.name??id;
 return [
  `# Candidate experiment: ${v.title}`,
  "",
  `Status: ${CANDIDATE_DESIGN_NOTE}`,
  `Graph version: ${model.version}`,
  "",
  `Question: ${name(v.fromId)} and ${name(v.toId)}${v.conditions.length?` (${v.conditions.join(", ")})`:""}`,
  `Candidate prediction: ${v.hypothesis.prediction}`,
  `What would count against it: ${v.hypothesis.falsifier}`,
  "",
  `Candidate design: ${v.experiment.design}`,
  "Controls recorded with the question:",
  ...v.experiment.controls.map(c=>`- ${c}`),
  "",
  "Recorded gaps it addresses:",
  ...v.gaps.map(g=>`- ${g.question} Missing: ${g.missing}`),
  "",
  v.chains.length?`Association chains in the graph: ${v.chains.length}. These are reported associations, not evidence for the prediction.`:"No association chain connects the two concepts in the graph.",
  "Every relationship in the graph is an unreviewed candidate.",
  "",
 ].join("\n");
}
