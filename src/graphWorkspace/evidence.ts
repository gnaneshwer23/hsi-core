/**
 * LEA-04E: evidence intelligence for the inspector. Pure views over the published graph, the candidate ontology
 * mappings and the concept-type proposals. Nothing here approves, reviews or merges anything:
 * - a passage's text is shown only when it is recorded and the source's licence is reported in an import receipt;
 *   with unverified rights only the locator is shown;
 * - correction and retraction status is reported as not checked, never as absent;
 * - an ontology identifier is a candidate label match, never a canonical identifier;
 * - a proposed concept type is a proposal, and is ignored if it was made against another graph version.
 */
import type {DomainSource} from "../knowledgeGraph/domainGraph";
import type {CandidateMappingsFile} from "../ontology/mappingReview";
import type {GraphAssertionView,GraphModel} from "./assertionView";

export type PassageDisplay="shown"|"withheld_rights"|"locator_only";
export type PassageView={locator:string;display:PassageDisplay;text:string|null};
export type SourceEvidenceView={
 id:string;title:string;doi:string|null;pmid:string|null;url:string;
 identity:DomainSource["identityStatus"];rights:DomainSource["rights"];
 passages:PassageView[];
 /** Counts for the summary line; `withheld` is recorded text not shown because rights are not established. */
 passageCounts:{total:number;shown:number;withheld:number;locatorOnly:number};
 correction:"not_checked";
};

/** Text is shown only with a licence reported in an import receipt. That is not human clearance, and the UI says so. */
export const rightsAllowDisplay=(r:DomainSource["rights"])=>r==="import_receipt_only";

export function passageView(src:DomainSource):PassageView[]{
 return src.passages.map(p=>p.text?rightsAllowDisplay(src.rights)?{locator:p.locator,display:"shown",text:p.text}:{locator:p.locator,display:"withheld_rights",text:null}:{locator:p.locator,display:"locator_only",text:null});
}

export function sourceEvidence(src:DomainSource):SourceEvidenceView{
 const passages=passageView(src);
 return {
  id:src.id,title:src.title,doi:src.doi,pmid:src.pmid,url:src.url,identity:src.identityStatus,rights:src.rights,passages,
  passageCounts:{total:passages.length,shown:passages.filter(p=>p.display==="shown").length,withheld:passages.filter(p=>p.display==="withheld_rights").length,locatorOnly:passages.filter(p=>p.display==="locator_only").length},
  correction:"not_checked",
 };
}

type Tally=readonly {value:string;count:number}[];
const tally=(xs:Iterable<string>):Tally=>{const m=new Map<string,number>();for(const x of xs)m.set(x,(m.get(x)??0)+1);return [...m].map(([value,count])=>({value,count})).sort((a,b)=>b.count-a.count||a.value.localeCompare(b.value))};

export type ConceptEvidence={
 conceptId:string;relationships:number;negated:number;
 sources:SourceEvidenceView[];
 /** Relationships with no source attached; they are shown, not dropped. */
 withoutSource:number;
 identifiers:{doi:number;pmid:number;neither:number};
 species:Tally;models:Tally;
 meanContextStated:number;recordable:number;
 passages:{shown:number;withheld:number;locatorOnly:number};
 gaps:number;questions:number;
 /** Every relationship's status is the same; it is repeated so a summary can never read as stronger than its parts. */
 status:"all_candidate_unreviewed";
};

/** Evidence around one concept, over the whole published graph (not only the current view), so it is never understated. */
export function conceptEvidence(model:GraphModel,conceptId:string):ConceptEvidence{
 const rel=model.assertions.filter(a=>a.subject.id===conceptId||a.object.id===conceptId);
 const ids=[...new Set(rel.map(a=>a.evidence.sourceId).filter((x):x is string=>!!x))].sort();
 const sources=ids.map(id=>model.sources.get(id)).filter((s):s is DomainSource=>!!s).map(sourceEvidence);
 const st=(a:GraphAssertionView,k:"species"|"modelSystem")=>a.context[k].state==="stated"?a.context[k].value:"Not stated";
 return {
  conceptId,relationships:rel.length,negated:rel.filter(a=>a.negated).length,
  sources,withoutSource:rel.filter(a=>!a.evidence.sourceId).length,
  identifiers:{doi:sources.filter(s=>s.doi).length,pmid:sources.filter(s=>s.pmid).length,neither:sources.filter(s=>!s.doi&&!s.pmid).length},
  species:tally(rel.map(a=>st(a,"species"))),models:tally(rel.map(a=>st(a,"modelSystem"))),
  meanContextStated:rel.length?Math.round((rel.reduce((s,a)=>s+a.contextCompleteness.stated,0)/rel.length)*10)/10:0,
  recordable:rel[0]?.contextCompleteness.recordable??8,
  passages:{shown:sources.reduce((s,x)=>s+x.passageCounts.shown,0),withheld:sources.reduce((s,x)=>s+x.passageCounts.withheld,0),locatorOnly:sources.reduce((s,x)=>s+x.passageCounts.locatorOnly,0)},
  gaps:model.gaps.filter(g=>g.subjectId===conceptId||g.objectId===conceptId).length,
  questions:model.questions.filter(q=>q.fromId===conceptId||q.toId===conceptId).length,
  status:"all_candidate_unreviewed",
 };
}

export type IdentifierCandidate={ontology:string;id:string;label:string;matchedOn:string;release:string|null};
export type ConceptIdentifiers=
 |{state:"candidate";candidates:IdentifierCandidate[];review:"unreviewed";approved:false}
 |{state:"ambiguous";candidates:IdentifierCandidate[];review:"unreviewed";approved:false}
 |{state:"unmapped";obsoleteOnly:boolean}
 |{state:"not_in_mapping_run"};

/** Candidate identifiers from the label-match run. Never presented as canonical; an ambiguous match stays ambiguous. */
export function conceptIdentifiers(file:CandidateMappingsFile,conceptId:string):ConceptIdentifiers{
 const m=file.mappings.find(x=>x.conceptId===conceptId);
 if(!m)return {state:"not_in_mapping_run"};
 const rel=new Map(file.ontologies.map(o=>[o.prefix,o.release]));
 const cands=m.candidates.map(c=>({ontology:c.ontology,id:c.id,label:c.label,matchedOn:c.matchedOn,release:rel.get(c.ontology)??null}));
 if(m.status==="candidate"&&cands.length)return {state:"candidate",candidates:cands,review:"unreviewed",approved:false};
 if(m.status==="ambiguous")return {state:"ambiguous",candidates:cands,review:"unreviewed",approved:false};
 return {state:"unmapped",obsoleteOnly:m.status==="obsolete_only"};
}

export type ConceptTypeProposalsFile={schemaVersion:string;mappedAgainst:string;rulesVersion:string;proposals:{conceptId:string;currentKind:string;proposedType:string;ruleId:string;reason:string;alternatives:{type:string;ruleId:string}[];confidence:string;status:string}[]};
export type TypeProposal=
 |{state:"proposed";proposedType:string;reason:string;alternatives:string[];rulesVersion:string;confidence:"uncalibrated"}
 |{state:"none"}
 |{state:"stale";mappedAgainst:string};

/** A proposed type for a generic concept. Shown as a proposal only, and only when made against this graph version. */
export function typeProposal(file:ConceptTypeProposalsFile,conceptId:string,graphVersion:string):TypeProposal{
 if(file.mappedAgainst!==graphVersion)return {state:"stale",mappedAgainst:file.mappedAgainst};
 const p=file.proposals.find(x=>x.conceptId===conceptId);
 if(!p||p.proposedType==="unclassified")return {state:"none"};
 return {state:"proposed",proposedType:p.proposedType.replaceAll("_"," "),reason:p.reason,alternatives:p.alternatives.map(a=>a.type.replaceAll("_"," ")),rulesVersion:file.rulesVersion,confidence:"uncalibrated"};
}
