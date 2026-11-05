import type {InterrogativeInvestigation} from "../../../src/interrogativeValidation";
export function InvestigationProgress({record}:{record:InterrogativeInvestigation}){
 const methods=record.provenance.agentRuns;
 return <section className="xp-investigation-progress" aria-label="Recorded investigation progress"><div><p className="xp-eyebrow">INVESTIGATION / RECORDED WORK</p><h2>Follow the investigation.</h2><p>Only saved activity is shown. A source selection or graph path does not establish a scientific conclusion.</p></div><div className="xp-progress-grid">{[
 ["Question & plan","Recorded",record.question],
 ["Evidence retrieval",record.provenance.retrievalIds.length?"References recorded":"No retrieval references recorded","Inspect the captured source context and its permissions below. A planner does not itself perform a search."],
 ["Competing explanations",record.branches.length+" candidate branches","Support, opposition, missing evidence and falsification questions remain explicit in the question tree."],
 ["Independent brief review",record.state.replaceAll("_"," "),"This state describes the saved investigation/brief workflow. Graph publication and clinical decisions are separately gated."]
 ].map(([title,status,detail])=><details key={title}><summary>{title}<span>{status}</span></summary><p>{detail}</p></details>)}</div><details><summary>Inspect recorded methods</summary>{methods.length?methods.map((m,i)=><p key={i}>{m.agentId} · version {m.version} · recorded model {m.modelVersion} · prompt {m.promptVersion} · {m.toolCalls.length} recorded tool calls</p>):<p>No method records supplied.</p>}<p>No unrecorded duration, confidence, provider call or agent progress is inferred.</p></details></section>;
}
