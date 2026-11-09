import {useEffect,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {
  DOMAIN_SCENARIO_HINT,
  homeDemoHref,
  RESEARCH_CONTEXT_KEYS,
  withResearchContext,
} from "../../lib/researchContext";
import {HOME_DOMAINS,STATUS_LABEL} from "./homeDomains";

/** Full eight-domain explorer below the hero — same truthfulness contract as the hero support layer. */
export function HomeEcosystem(){
  const [params,setParams]=useSearchParams();
  const domainFromUrl=params.get(RESEARCH_CONTEXT_KEYS.domain);
  const initial=HOME_DOMAINS.some(d=>d.id===domainFromUrl)?domainFromUrl!:"biology";
  const [active,setActiveState]=useState(initial);
  const domain=HOME_DOMAINS.find(d=>d.id===active)??HOME_DOMAINS[2]!;
  const connected=new Set(domain.connected);
  const scenarioHint=DOMAIN_SCENARIO_HINT[domain.id];

  function setActive(id:string){
    setActiveState(id);
    setParams(prev=>{
      const next=new URLSearchParams(prev);
      next.set(RESEARCH_CONTEXT_KEYS.domain,id);
      return next;
    },{replace:true});
  }

  useEffect(()=>{
    if(domainFromUrl&&HOME_DOMAINS.some(d=>d.id===domainFromUrl))setActiveState(domainFromUrl);
  },[domainFromUrl]);

  return <section className="ed-ecosystem-map ed-section-compact" aria-labelledby="ecosystem-heading">
    <div className="ed-ecosystem-copy">
      <p className="ed-kicker">Eight-domain ecosystem</p>
      <h2 id="ecosystem-heading">Select a domain.<br/>Stay with the same investigation.</h2>
      <p>Selection updates this desk and the URL <code>?domain=</code>. Unavailable domains stay labelled. Links keep domain context — never invent live clinical connectivity.</p>
    </div>
    <div className="ed-ecosystem-board ed-ecosystem-board-simple">
      <div className="ed-ecosystem-chooser" role="toolbar" aria-label="Research domains">
        <div className="ed-ecosystem-row ed-ecosystem-row-8">
          {HOME_DOMAINS.map(d=>{
            const related=connected.has(d.id);
            return <button
              key={d.id}
              type="button"
              className={"ed-ecosystem-domain"+(related&&active!==d.id?" ed-ecosystem-domain-related":"")}
              aria-pressed={active===d.id}
              onClick={()=>setActive(d.id)}
            >
              <strong>{d.label}</strong>
              <span className="ed-ecosystem-domain-blurb">{d.shows}</span>
              <small>{STATUS_LABEL[d.status]}</small>
            </button>;
          })}
        </div>
      </div>
      <article className="ed-ecosystem-detail" aria-live="polite">
        <p className="ed-kicker">{domain.label}</p>
        <p className="ed-status-chip" data-status={domain.status}>{STATUS_LABEL[domain.status]}</p>
        <h3>{domain.label}</h3>
        <p>{domain.blurb}</p>
        <p className="ed-scope-line">Connected domains: {domain.connected.map(id=>HOME_DOMAINS.find(d=>d.id===id)?.label??id).join(" · ")}</p>
        <ol className="ed-mechanism-path ed-mechanism-path-compact" aria-label={`${domain.label} mini mechanism`}>
          {domain.path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
        </ol>
        <p className="ed-scope-line">{domain.visualNote}</p>
        <p className="ed-scope-line">{domain.action}</p>
        <div className="ed-actions">
          <Link className="ed-text-link" to={homeDemoHref({scenarioId:scenarioHint,domain:domain.id})}>
            View demonstration on this page <span aria-hidden="true"><ArrowIcon direction="right"/></span>
          </Link>
          {domain.to&&domain.cta
            ?<Link className="ed-button" to={withResearchContext(domain.to,{domain:domain.id,scenario:scenarioHint})}>
              {domain.cta} <span aria-hidden="true"><ArrowIcon/></span>
            </Link>
            :<p className="ed-scope-line" role="status">No live destination yet — capability remains {STATUS_LABEL[domain.status].toLowerCase()}.</p>}
        </div>
      </article>
    </div>
  </section>;
}
