import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {HOME_DOMAINS,STATUS_LABEL} from "./homeDomains";

/** Full eight-domain explorer below the hero — same truthfulness contract as the hero support layer. */
export function HomeEcosystem(){
  const [active,setActive]=useState("biology");
  const domain=HOME_DOMAINS.find(d=>d.id===active)??HOME_DOMAINS[2]!;
  const connected=new Set(domain.connected);
  return <section className="ed-ecosystem-map ed-section-compact" aria-labelledby="ecosystem-heading">
    <div className="ed-ecosystem-copy">
      <p className="ed-kicker">Eight-domain ecosystem</p>
      <h2 id="ecosystem-heading">Select a domain.<br/>Stay with the same investigation.</h2>
      <p>Hover and select update this desk first. Unavailable domains stay labelled. Optional links go to a real route or honesty page — never invent live clinical connectivity.</p>
    </div>
    <div className="ed-ecosystem-board ed-ecosystem-board-simple">
      <div className="ed-ecosystem-chooser" aria-label="Research domains">
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
          <a className="ed-text-link" href="#product-demo">View demonstration on this page <span aria-hidden="true"><ArrowIcon direction="right"/></span></a>
          {domain.to&&domain.cta?<Link className="ed-button" to={domain.to}>{domain.cta} <span aria-hidden="true"><ArrowIcon/></span></Link>:null}
        </div>
      </article>
    </div>
  </section>;
}
