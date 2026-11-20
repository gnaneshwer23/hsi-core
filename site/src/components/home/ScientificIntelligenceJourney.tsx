import {useEffect,useRef,useState} from "react";
import {Link} from "react-router-dom";
import {LIVE_INVESTIGATION_PATH} from "../../lib/workbenchPrimary";

/** Ordered stages of the public HSI scientific intelligence narrative. Sequence itself carries meaning. */
export const INTELLIGENCE_JOURNEY=[
 {
  id:"evidence",
  title:"Biomedical evidence",
  detail:"Publications · Experiments · Omics · Biological data",
  text:"Live public literature and structured sources enter with provenance. Failed searches stay visible as failures, not as empty answers.",
 },
 {
  id:"verification",
  title:"Scientific verification",
  detail:"Provenance and uncertainty",
  text:"Each finding keeps locators, context and review status. Metadata retrieved is not claim verification; clearance remains explicit when unverified.",
 },
 {
  id:"graph",
  title:"Knowledge graph",
  detail:"Mechanisms and relationships",
  text:"Candidate relationships connect genes, cells, diseases and drugs across systems — always inspectable, never silently promoted.",
 },
 {
  id:"investigation",
  title:"AI-powered scientific investigation",
  detail:"Evidence synthesis · Contradictions · Gaps · Hypotheses",
  text:"Compare findings by experimental context, surface insufficient comparability separately from conflict, and mark hypotheses as provisional.",
 },
 {
  id:"decisions",
  title:"Evidence-informed research decisions",
  detail:"Traceable conclusions with explicit uncertainty",
  text:"A decision brief links passport columns, limitations and next questions — not clinical advice, and not scientifically approved by default.",
 },
] as const;

export function ScientificIntelligenceJourney(){
 const root=useRef<HTMLElement|null>(null);
 const [active,setActive]=useState(0);
 const [reducedMotion,setReducedMotion]=useState(false);

 useEffect(()=>{
  const mq=window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync=()=>setReducedMotion(mq.matches);
  sync();
  mq.addEventListener("change",sync);
  return ()=>mq.removeEventListener("change",sync);
 },[]);

 useEffect(()=>{
  const rootEl=root.current;
  if(!rootEl||reducedMotion)return;
  const nodes=Array.from(rootEl.querySelectorAll<HTMLElement>("[data-journey-step]"));
  if(!nodes.length)return;
  const io=new IntersectionObserver(
   (entries)=>{
    const visible=entries
     .filter((e)=>e.isIntersecting)
     .sort((a,b)=>(b.intersectionRatio??0)-(a.intersectionRatio??0));
    const top=visible[0]?.target.getAttribute("data-journey-step");
    if(top==null)return;
    const idx=Number(top);
    if(Number.isFinite(idx))setActive(idx);
   },
   {root:null,rootMargin:"-28% 0px -45% 0px",threshold:[0.2,0.55,0.85]},
  );
  for(const node of nodes)io.observe(node);
  return ()=>io.disconnect();
 },[reducedMotion]);

 return (
  <section
   ref={root}
   className="pg-journey"
   aria-labelledby="pg-journey-h"
   data-active={String(active)}
  >
   <div className="pg-journey-head">
    <h2 id="pg-journey-h">One connected scientific intelligence journey.</h2>
    <p>
     Evidence ingestion, verification, the Living Knowledge Graph, investigation and research decisions operate as one loop — not a catalogue of disconnected tools.
    </p>
    <div className="pg-cta">
     <Link className="pg-link" to="/how-it-works">
      Explore the platform <span aria-hidden="true">→</span>
     </Link>
     <Link className="pg-link" to={LIVE_INVESTIGATION_PATH}>
      Open scientific workbench <span aria-hidden="true">→</span>
     </Link>
    </div>
   </div>
   <ol className="pg-journey-rail" aria-label="Scientific intelligence journey">
    {INTELLIGENCE_JOURNEY.map((step,i)=>{
     const on=reducedMotion||i===active;
     return (
      <li
       key={step.id}
       data-journey-step={String(i)}
       className={on?"is-active":undefined}
       aria-current={on?"step":undefined}
      >
       <span className="pg-journey-index" aria-hidden="true">
        {String(i+1).padStart(2,"0")}
       </span>
       <div className="pg-journey-body">
        <h3>{step.title}</h3>
        <p className="pg-journey-detail">{step.detail}</p>
        <p>{step.text}</p>
       </div>
      </li>
     );
    })}
   </ol>
  </section>
 );
}
