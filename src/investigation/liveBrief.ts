/** Browser-safe brief renderer (no Node imports). Pure text; it grants no source-use permission and shows no abstracts. */
import type {LiveInvestigation} from "./liveRun";
const safe=(s:string)=>s.replace(/[<>&`*_\[\]#|]/g,c=>"&#"+c.charCodeAt(0)+";").replace(/[\r\n]+/g," ");
const DIR:Record<string,string>={positive:"positive (rise or act together, or promotes)",negative:"negative (inverse, or suppresses)",none:"no relationship stated",association_only:"linked, direction not stated",unresolved:"unresolved (the checks disagreed or could not tell)",not_assessed:"not assessed"};
export function renderLiveBriefMarkdown(b:LiveInvestigation):string{
 const rec=new Map(b.records.map(r=>[r.sourceId,r]));
 const ctx=(k:string)=>b.byContext[k]?.label??k;
 const item=(c:LiveInvestigation["candidates"][number])=>{
  const r=rec.get(c.sourceId);
  return [`- **${safe(c.subject)} ~ ${safe(c.object)}** (${c.contexts.map(ctx).map(safe).join(", ")||"disease context not stated"}${c.species?`; ${c.species}`:""})`,
   `  - Direction: ${DIR[c.direction]??c.direction}`,
   `  - Passage: "${safe(c.sentence)}"`,
   `  - Source: ${safe(r?.title??c.sourceId)} · ${r?.doi?`DOI ${safe(r.doi)} · `:""}${r?.pmid?`PMID ${safe(r.pmid)} · `:""}${c.sourceUrl} · retrieved ${r?.retrievedAt??"unknown"} · retraction: ${(r?.retraction??"unknown").replaceAll("_"," ")} · licence not assessed`,
   ...c.verdicts.map(v=>`  - ${safe(v.verifier)} (${safe(v.model)}): ${v.direction.replaceAll("_"," ")}. ${safe(v.reason)}${v.evidenceSpan?` Quoted: "${safe(v.evidenceSpan)}"`:""}`)].join("\n");
 };
 const checked=b.candidates.filter(c=>c.verification!=="not_run");
 const part=(title:string,list:typeof b.candidates,empty:string)=>[`## ${title} (${list.length})`,...(list.length?list.map(item):[empty])];
 const v=b.verification;
 return [
  "# Live investigation brief",safe(b.question),"",
  `Version ${b.version} · ${b.briefHash.slice(0,16)} · scenario ${safe(b.scenarioId)}`,
  "**Candidate-only. Unreviewed. Not scientific approval, not graph-promotable, no clinical advice, no patient data.** Abstract-level evidence only.","",
  "## Execution",...b.events.map(e=>`- ${e.at} · ${e.stage}: ${e.status}. ${safe(e.detail)}`),
  `- Model challenge: ${v.status.replaceAll("_"," ")}${v.status==="not_configured"?` (${safe(v.reason??"")})`:`; ${v.checked} claims checked; ${v.independence==="separate_providers_unverified"?"separate providers, independence unverified":"independent execution only (same provider), not independent providers"}. Agreement between models is not scientific proof.`}`,
  ...(b.budget?[`- Model budget used: ${JSON.stringify(b.budget)}`]:[]),"",
  "## Searches",...b.searches.map(x=>`- ${x.provider} / ${ctx(x.context)}: ${x.status}, ${x.count} records${x.error?` (${safe(x.error)})`:""}`),"",
  ...part("Supporting (both checks agree)",checked.filter(c=>c.polarity==="supporting"),"None."),"",
  ...part("Opposing (both checks agree)",checked.filter(c=>c.polarity==="opposing"),v.status==="not_configured"?"Not assessed: the model challenge did not run.":"None found in these sources. This does not establish consensus."),"",
  ...part("Checked, no direction established",checked.filter(c=>c.polarity==="uncertain"),"None."),"",
  `## Hypotheses (unvalidated model proposals) (${b.hypotheses.items.length})`,
  ...(b.hypotheses.items.length?["Proposed from findings both checks agreed on. They are not findings, not recommendations and have not been reviewed.",...b.hypotheses.items.flatMap(h=>[
   `- **${safe(h.statement)}**`,
   `  - Based on: ${h.citedClaimIds.map(id=>{const c=b.candidates.find(x=>x.id===id);return c?`${safe(c.subject)} ~ ${safe(c.object)} (${safe(rec.get(c.sourceId)?.title??c.sourceId)})`:safe(id)}).join("; ")}`,
   `  - Rationale: ${safe(h.rationale)}`,`  - Prediction if true: ${safe(h.prediction)}`,`  - Experiment: ${safe(h.experiment)}`,`  - Would be falsified by: ${safe(h.falsifier)}`,`  - Limits: ${safe(h.limits)}`,
   `  - Proposed by ${safe(h.generatedBy.verifier)} (${safe(h.generatedBy.model)}). ${h.challenge?`Challenged by ${safe(h.challenge.verifier)} (${safe(h.challenge.model)}): ${h.challenge.verdict}. ${safe(h.challenge.reason)}`:"Not challenged by a second model."}`])]:[`- ${safe(b.hypotheses.reason??b.hypotheses.status)}`]),"",
  `## Not checked (${b.candidates.length-checked.length} lower-priority candidates, directions not assessed)`,
  ...b.candidates.filter(c=>c.verification==="not_run").map(c=>`- ${safe(c.subject)} ~ ${safe(c.object)} (${c.contexts.map(ctx).map(safe).join(", ")||"context not stated"}): "${safe(c.sentence)}" ${c.sourceUrl}`),"",
  "## Missing evidence and limits",...b.gaps.map(g=>"- "+safe(g)),
  "- Abstracts are not included in this export; licence for redistribution was not assessed.",
  "- Current source permissions must be rechecked before this brief is shared or cited.",""
 ].join("\n");
}
