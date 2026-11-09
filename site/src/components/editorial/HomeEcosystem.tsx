import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";

type DomainStatus="available_and_verified"|"research_preview"|"in_development"|"not_currently_available";
type Domain={
  id:string;
  label:string;
  tier:"primary"|"supporting";
  status:DomainStatus;
  blurb:string;
  to:string;
  cta:string;
};

const STATUS_LABEL:Record<DomainStatus,string>={
  available_and_verified:"Available and verified",
  research_preview:"Research preview",
  in_development:"In development",
  not_currently_available:"Not currently available",
};

const DOMAINS:Domain[]=[
  {id:"biology",label:"Biology",tier:"primary",status:"research_preview",blurb:"Cells, tissues, pathways and molecular signals — inspect relationships before treating a path as a mechanism.",to:"/science",cta:"Explore biology"},
  {id:"evidence",label:"Evidence",tier:"primary",status:"research_preview",blurb:"Source-linked claims, supporting and conflicting findings, context and review status — not a confidence score.",to:"/evidence-safety",cta:"Explore evidence intelligence"},
  {id:"clinical",label:"Clinical context",tier:"primary",status:"research_preview",blurb:"Research and education context for clinical questions. Not patient-specific advice or live care connectivity.",to:"/research",cta:"Research at HSI"},
  {id:"trials",label:"Trials",tier:"primary",status:"not_currently_available",blurb:"Therapeutic and registered-study context is planned. No live matching, eligibility confirmation or enrolment.",to:"/for-trials",cta:"Read HSI Trials scope"},
  {id:"health",label:"Health",tier:"supporting",status:"research_preview",blurb:"Personal health context lives in separately governed Aksh experiences — not inside HSI research writes.",to:"/for-aksh",cta:"Aksh Health"},
  {id:"immunity",label:"Immunity",tier:"supporting",status:"research_preview",blurb:"Immune biology and ISI research surfaces share technology while keeping product boundaries.",to:"/for-isi",cta:"ISI research"},
  {id:"microbiome",label:"Microbiome",tier:"supporting",status:"research_preview",blurb:"Gut–immune and metabolic candidates appear in the knowledge graph with model and gap labels.",to:"/research/knowledge-graph",cta:"Open knowledge graph"},
  {id:"omics",label:"Omics",tier:"supporting",status:"in_development",blurb:"Omics connectors remain developmental. No live multi-omics product surface is claimed here.",to:"/technology",cta:"Technology overview"},
];

export function HomeEcosystem(){
  const [active,setActive]=useState("biology");
  const domain=DOMAINS.find(d=>d.id===active)??DOMAINS[0]!;
  const primary=DOMAINS.filter(d=>d.tier==="primary");
  const supporting=DOMAINS.filter(d=>d.tier==="supporting");
  return <section className="ed-ecosystem-map" aria-labelledby="ecosystem-heading">
    <div className="ed-ecosystem-copy">
      <p className="ed-kicker">HSI CONNECTED RESEARCH ECOSYSTEM</p>
      <h2 id="ecosystem-heading">One instrument.<br/><em>Many research contexts.</em></h2>
      <p>Select a domain to see what HSI can open today. Status comes from the public capability register — a rendered panel is not proof of a live backend.</p>
    </div>
    <div className="ed-ecosystem-board">
      <div className="ed-ecosystem-desktop" aria-label="Research domains">
        <div className="ed-ecosystem-row">{primary.map(d=><button key={d.id} type="button" className="ed-ecosystem-domain" aria-pressed={active===d.id} onClick={()=>setActive(d.id)}><strong>{d.label}</strong><small>{STATUS_LABEL[d.status]}</small></button>)}</div>
        <p className="ed-ecosystem-hub" aria-hidden="true">HSI knowledge graph</p>
        <div className="ed-ecosystem-row">{supporting.map(d=><button key={d.id} type="button" className="ed-ecosystem-domain" aria-pressed={active===d.id} onClick={()=>setActive(d.id)}><strong>{d.label}</strong><small>{STATUS_LABEL[d.status]}</small></button>)}</div>
      </div>
      <div className="ed-ecosystem-mobile" aria-label="Explore HSI domains">
        {DOMAINS.map(d=><button key={d.id} type="button" className="ed-ecosystem-domain" aria-pressed={active===d.id} onClick={()=>setActive(d.id)}><strong>{d.label}</strong><span>{d.blurb}</span><small>{STATUS_LABEL[d.status]}</small></button>)}
      </div>
      <article className="ed-ecosystem-detail" aria-live="polite">
        <p className="ed-kicker">{domain.label}</p>
        <p className="ed-status-chip" data-status={domain.status}>{STATUS_LABEL[domain.status]}</p>
        <h3>{domain.label}</h3>
        <p>{domain.blurb}</p>
        <Link className="ed-button" to={domain.to}>{domain.cta} <span aria-hidden="true"><ArrowIcon/></span></Link>
      </article>
    </div>
  </section>;
}
