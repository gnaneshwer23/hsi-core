import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";

type DomainStatus="research_preview"|"in_development"|"not_currently_available";
type Domain={
  id:string;
  label:string;
  status:DomainStatus;
  blurb:string;
  action:string;
  /** Prefer product tools over manifesto landings; omit when the panel is enough. */
  to?:string;
  cta?:string;
};

const STATUS_LABEL:Record<DomainStatus,string>={
  research_preview:"Research preview",
  in_development:"In development",
  not_currently_available:"Not currently available",
};

/** Primary domains only — supporting topics stay in the product architecture section to avoid bounce through similar pages. */
const DOMAINS:Domain[]=[
  {id:"biology",label:"Biology",status:"research_preview",blurb:"Cells, tissues, pathways and molecular signals. Inspect relationships before treating a path as a mechanism.",action:"Stay on this page to read the mechanism map, or open the biology graph tool.",to:"/science/graph",cta:"Open biology graph"},
  {id:"evidence",label:"Evidence",status:"research_preview",blurb:"Source-linked claims, supporting and conflicting findings, context and review status — not a confidence score.",action:"The demonstration above shows illustrative evidence states. Deepen with the evidence approach page when ready.",to:"/evidence-safety",cta:"Explore Evidence Intelligence"},
  {id:"clinical",label:"Clinical context",status:"research_preview",blurb:"Research and education context for clinical questions. Not patient-specific advice or live care connectivity.",action:"Clinical context is explained in Research — it does not open a care record or EHR.",to:"/research",cta:"Open Research overview"},
  {id:"trials",label:"Trials",status:"not_currently_available",blurb:"Therapeutic and registered-study context is planned. No live matching, eligibility confirmation or enrolment.",action:"Read the Trials scope page for honesty labels — capability is not live.",to:"/for-trials",cta:"Read Trials scope"},
];

export function HomeEcosystem(){
  const [active,setActive]=useState("biology");
  const domain=DOMAINS.find(d=>d.id===active)??DOMAINS[0]!;
  return <section className="ed-ecosystem-map" aria-labelledby="ecosystem-heading">
    <div className="ed-ecosystem-copy">
      <p className="ed-kicker">EXPLORE A RESEARCH DOMAIN</p>
      <h2 id="ecosystem-heading">Pick a lens.<br/><em>Stay with the same investigation.</em></h2>
      <p>Domain buttons update this page first. They do not invent live clinical connectivity. Optional links go to a distinct product tool or honesty page — not another copy of the homepage manifesto.</p>
    </div>
    <div className="ed-ecosystem-board ed-ecosystem-board-simple">
      <div className="ed-ecosystem-desktop" aria-label="Research domains">
        <div className="ed-ecosystem-row ed-ecosystem-row-4">{DOMAINS.map(d=><button key={d.id} type="button" className="ed-ecosystem-domain" aria-pressed={active===d.id} onClick={()=>setActive(d.id)}><strong>{d.label}</strong><small>{STATUS_LABEL[d.status]}</small></button>)}</div>
      </div>
      <div className="ed-ecosystem-mobile" aria-label="Explore HSI domains">
        {DOMAINS.map(d=><button key={d.id} type="button" className="ed-ecosystem-domain" aria-pressed={active===d.id} onClick={()=>setActive(d.id)}><strong>{d.label}</strong><span>{d.blurb}</span><small>{STATUS_LABEL[d.status]}</small></button>)}
      </div>
      <article className="ed-ecosystem-detail" aria-live="polite">
        <p className="ed-kicker">{domain.label}</p>
        <p className="ed-status-chip" data-status={domain.status}>{STATUS_LABEL[domain.status]}</p>
        <h3>{domain.label}</h3>
        <p>{domain.blurb}</p>
        <p className="ed-scope-line">{domain.action}</p>
        <div className="ed-actions">
          <a className="ed-text-link" href="#product-demo">View demonstration on this page <span aria-hidden="true"><ArrowIcon direction="right"/></span></a>
          {domain.to&&domain.cta?<Link className="ed-button" to={domain.to}>{domain.cta} <span aria-hidden="true"><ArrowIcon/></span></Link>:null}
        </div>
      </article>
    </div>
  </section>;
}
