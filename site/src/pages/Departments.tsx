import {Link} from "react-router-dom";
import {departmentBySlug,departmentPath,departments,type Department} from "../lib/departments";
import "../styles/departments.css";

function Arrow(){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18"><path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}

/** Honest coverage line: counts come from the public research graph and are unreviewed candidates. */
function Coverage({d}:{d:Department}){
 return d.graphConcepts>0
  ? <p className="dept-coverage"><span className="dept-status">Research preview</span>{d.graphConcepts} candidate concepts in the public research graph are tagged to this area. They are unreviewed candidates, not validated knowledge.</p>
  : <p className="dept-coverage"><span className="dept-status dept-status-dev">In development</span>No concept in the public research graph is tagged to this area yet. This page describes the intended scope.</p>;
}

export function DepartmentsIndex(){
 return <div className="dept-page">
  <section className="dept-hero"><div className="dept-shell">
   <h1>Biology does not respect departmental lines.</h1>
   <p className="dept-lead">HSI organises scientific investigation around six interconnected perspectives. They share one evidence-linked graph, so a question that starts in one department can follow the biology into the others without losing its sources or its context.</p>
  </div></section>
  <section className="dept-shell dept-grid-section" aria-labelledby="dept-index-heading">
   <h2 id="dept-index-heading" className="dept-sr">The six departments</h2>
   <ul className="dept-grid">{departments.map(d=><li key={d.slug}><Link to={departmentPath(d.slug)} className="dept-card">
    <span className="dept-card-name">{d.name}</span><span className="dept-card-tag">{d.tagline}</span>
    <span className="dept-card-cov">{d.graphConcepts>0?`${d.graphConcepts} candidate concepts in the research graph`:"No graph coverage yet"}</span>
    <span className="dept-card-go">Explore <Arrow/></span></Link></li>)}</ul>
   <p className="dept-note">Diseases, genes, pathways, cells, tissues and metabolites are research contexts that cut across these departments. You can start from any of them, or from a question. <Link to="/science">See how the science pages work</Link>.</p>
  </section>
 </div>;
}

export function DepartmentPage({slug}:{slug:string}){
 const d=departmentBySlug(slug);
 if(!d)return <div className="dept-page"><div className="dept-shell dept-missing"><h1>Department not found.</h1><Link to="/departments">Return to the departments</Link></div></div>;
 const i=departments.indexOf(d),next=departments[(i+1)%departments.length]!;
 return <div className="dept-page">
  <section className="dept-hero"><div className="dept-shell">
   <nav className="dept-crumb" aria-label="Breadcrumb"><Link to="/departments">Departments</Link><span aria-hidden="true">/</span><span>{d.name}</span></nav>
   <h1>{d.name}</h1>
   <p className="dept-tagline">{d.tagline}</p>
   <p className="dept-lead">{d.summary}</p>
   <Coverage d={d}/>
   <div className="dept-actions"><Link className="dept-button" to="/research/knowledge-graph">Explore the knowledge graph<Arrow/></Link><Link className="dept-link" to="/how-it-works">How an investigation works<Arrow/></Link></div>
  </div></section>
  <section className="dept-shell dept-section" aria-labelledby="dept-explore"><h2 id="dept-explore">What you can explore</h2>
   <ul className="dept-chips">{d.explore.map(t=><li key={t}>{t}</li>)}</ul></section>
  <section className="dept-shell dept-section" aria-labelledby="dept-questions"><h2 id="dept-questions">Questions this department helps frame</h2>
   <p className="dept-aside">Illustrative questions, written to show the kind of investigation HSI supports. They are not findings, and the graph does not yet answer them.</p>
   <ol className="dept-questions">{d.questions.map(q=><li key={q}>{q}</li>)}</ol></section>
  <section className="dept-shell dept-section" aria-labelledby="dept-connections"><h2 id="dept-connections">Connected departments</h2>
   <ul className="dept-connections">{d.connections.map(c=>{const o=departmentBySlug(c.slug);return o?<li key={c.slug}><Link to={departmentPath(o.slug)}><strong>{o.name}</strong><span>{c.why}</span><Arrow/></Link></li>:null})}</ul></section>
  <section className="dept-shell dept-section dept-integrity" aria-labelledby="dept-integrity"><h2 id="dept-integrity">What a connection means here</h2>
   <p>A link between two concepts is a candidate relationship with its source, context and uncertainty attached. It is not a claim that the relationship is established. Evidence, interpretation, independent verification and graph publication are separate decisions. <Link to="/trust">Read the review boundaries</Link>.</p></section>
  <section className="dept-shell dept-next"><Link to={departmentPath(next.slug)}>Next department: {next.name}<Arrow/></Link></section>
 </div>;
}
