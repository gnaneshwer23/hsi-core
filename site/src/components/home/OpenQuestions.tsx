import {Link} from "react-router-dom";
import {useSharedBundle} from "../../lib/useSharedBundle";

const pretty=(s:string)=>s.replaceAll("_"," ");
/** The research gaps recorded in the published graph, as the questions HSI is open on today. Read from the snapshot, never written by hand. */
export function OpenQuestions(){
 const {bundle:b,failed}=useSharedBundle();
 if(failed)return <p className="oq-wait" role="status">Snapshot unavailable. No substitute questions are shown.</p>;
 if(!b)return <p className="oq-wait" role="status">Verifying the published snapshot…</p>;
 return (
  <ul className="oq-list" aria-label="Open research questions recorded in the graph">
   {b.gaps.map(g=>(
    <li key={g.id}>
     <Link to={"/research/knowledge-graph?netScope=global&node="+encodeURIComponent(g.subjectId)}>
      <span className="oq-q">{g.question}</span>
      <span className="oq-meta">{g.domains.map(pretty).join(" · ")}{g.conditions.length?` · ${g.conditions.join(", ")}`:""}</span>
     </Link>
    </li>
   ))}
  </ul>
 );
}
