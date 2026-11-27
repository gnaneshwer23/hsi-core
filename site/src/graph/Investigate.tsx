import {
 CANDIDATE_DESIGN_NOTE,CANDIDATE_QUESTION_NOTE,experimentBrief,type GraphModel,type QuestionView,type TracedPath,
} from "../../../src/graphWorkspace";

type Props={
 model:GraphModel;questions:readonly QuestionView[];experimental:boolean;
 activePath:TracedPath|null;onTrace:(p:TracedPath|null)=>void;onSelectConcept:(id:string)=>void;onSelectGap:(gapId:string,subjectId:string)=>void;
};

function download(text:string,name:string){
 const url=URL.createObjectURL(new Blob([text],{type:"text/markdown"})),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/** LEA-04H: recorded questions as candidate hypotheses, and their candidate experiments. Nothing here is validated. */
export function QuestionsPanel({model,questions,experimental,activePath,onTrace,onSelectConcept,onSelectGap}:Props){
 const name=(id:string)=>model.nodes.get(id)?.name??id;
 const title=experimental?"Candidate experiments":"Candidate hypotheses";
 return (
  <section className="gw-card gw-wide" aria-labelledby="gw-q"><h2 id="gw-q">{title} ({questions.length})</h2>
   <p className="gw-hint">{experimental?CANDIDATE_DESIGN_NOTE:CANDIDATE_QUESTION_NOTE}</p>
   {questions.length?<ol className="gw-qs">{questions.map(q=>(
    <li key={q.id}>
     <article aria-labelledby={`gw-q-${q.id}`}>
      <h3 id={`gw-q-${q.id}`}>{q.title}</h3>
      <p className="gw-q-ends"><button type="button" className="gw-link" onClick={()=>onSelectConcept(q.fromId)}>{name(q.fromId)}</button> and <button type="button" className="gw-link" onClick={()=>onSelectConcept(q.toId)}>{name(q.toId)}</button>{q.conditions.length?<small> · {q.conditions.join(", ")}</small>:null}</p>
      <ul className="gw-status"><li>{experimental?"Candidate design":"Candidate question"}</li><li>{experimental?"Not a protocol":"Not validated"}</li></ul>
      {experimental?<>
       <dl className="gw-ctx">
        <div><dt>Candidate design</dt><dd>{q.experiment.design}</dd></div>
        <div><dt>What it tests</dt><dd>{q.hypothesis.prediction}</dd></div>
        <div><dt>What would count against it</dt><dd>{q.hypothesis.falsifier}</dd></div>
       </dl>
       <h4>Controls recorded with the question</h4>
       <ul className="gw-list">{q.experiment.controls.map(c=><li key={c}>{c}</li>)}</ul>
       <p className="gw-hint">Before any use it needs scientific review, a sample-size and power analysis, and ethics approval. HSI does none of these.</p>
       <button type="button" className="gw-btn" onClick={()=>download(experimentBrief(model,q),`hsi-candidate-experiment-${q.id}.md`)}>Download candidate brief</button>
      </>:<dl className="gw-ctx">
        <div><dt>Candidate prediction</dt><dd>{q.hypothesis.prediction}</dd></div>
        <div><dt>What would count against it</dt><dd>{q.hypothesis.falsifier}</dd></div>
        <div><dt>Recorded summary</dt><dd>{q.summary}</dd></div>
       </dl>}
      <h4>Recorded gaps ({q.gaps.length})</h4>
      <ul className="gw-list">{q.gaps.map(g=><li key={g.id}><button type="button" onClick={()=>onSelectGap(g.id,g.subjectId)}>{g.question}</button><small>Missing: {g.missing}</small></li>)}</ul>
      <h4>Association chains in this view</h4>
      {q.chains.length?<ol className="gw-list" aria-label={`Association chains for ${q.title}`}>{q.chains.map((c,i)=><li key={i} data-active={activePath===c||undefined}><button type="button" aria-pressed={activePath===c} onClick={()=>onTrace(activePath===c?null:c)}>{c.nodeIds.map(name).join(" → ")} <small>({c.hops} hop{c.hops>1?"s":""})</small></button></li>)}</ol>
       :<p className="gw-hint" role="status">No chain of up to 4 reported relationships connects these two concepts in this view. The question stands on its recorded gaps, not on a path in the graph.</p>}
      <p className="gw-hint">A chain is a sequence of reported associations. It is not evidence for the prediction.</p>
     </article>
    </li>))}</ol>:<p className="gw-hint">No recorded question touches this view. Try the whole published graph.</p>}
  </section>
 );
}
