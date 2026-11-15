import {Link} from "react-router-dom";

/** Real screens from the research preview, captured 15 November 2026 from a live run. Not mock-ups: figures in them are live results. */
const IMG="/images/product/";
function Shot({name,w,h,alt,eager=false}:{name:string;w:number;h:number;alt:string;eager?:boolean}){
 return <div className="ps-frame"><div className="ps-chrome" aria-hidden="true"><i/><i/><i/></div><img src={`${IMG}${name}.webp`} width={w} height={h} alt={alt} loading={eager?"eager":"lazy"} decoding="async" {...(eager?{fetchPriority:"high" as const}:{})}/></div>;
}

export function StoryHero(){
 return (
  <section className="ps-hero" aria-labelledby="home-title">
   <div className="ps-hero-copy">
    <p className="ps-eyebrow">Research preview · candidate-only · nothing scientifically approved</p>
    <h1 id="home-title">Know what the evidence says, where it disagrees, and what is still untested.</h1>
    <p className="ps-lead">HSI turns open literature and a verified knowledge graph into a research home for your own topics: what is new, where the gaps are, and investigations in which every claim keeps its source, context and review status.</p>
    <div className="ps-cta"><Link className="sp-button" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link><a href="#home-knowledge-graph">Explore the graph ↓</a></div>
    <p className="ps-micro">No account needed to start. Your set-up is saved on your device.</p>
   </div>
   <figure className="ps-hero-shot">
    <Shot name="home" w={1440} h={900} eager alt="The HSI research home: a search box, a research radar showing 6 new papers on IL-21 and 22 on systemic sclerosis in seven days with a ten-year publication trend, and a gap finder below."/>
    <figcaption>The research home, with live results for two example topics.</figcaption>
   </figure>
  </section>
 );
}

type Row={id:string;tag:string;title:string;points:string[];shot:{name:string;w:number;h:number;alt:string};note:string;link:{to:string;label:string}};
const ROWS:Row[]=[
 {id:"radar",tag:"Live now · no account",title:"See what is new in your area.",points:["New papers for each of your topics in the last 2, 7 or 30 days, with journal, date and retraction flags.","A ten-year publication trend, so you can tell a growing field from a settled one.","Your own papers from your ORCID iD, and a digest you can download."],
  shot:{name:"radar",w:1092,h:386,alt:"The research radar: IL-21 with 6 new papers in 7 days and systemic sclerosis with 22, each with a small publication trend line and an expandable list of the latest papers."},note:"Europe PMC and OpenAlex, generated when you open it. Counts are volume, not quality.",link:{to:"/welcome",label:"Set up your radar"}},
 {id:"gaps",tag:"Live now · heuristic",title:"Find where the literature is thin.",points:["Gaps recorded in the verified graph appear on their own, with their source and a possible next study.","Under-explored intersections come from literature counts: both topics well studied, few papers on both.","Every row shows its counts and links to the exact search, so you can check it before you rely on it."],
  shot:{name:"gaps",w:1092,h:760,alt:"The gap finder: systemic sclerosis with T follicular helper cells flagged as an under-explored intersection with 7 papers mentioning both, against 22,733 and 1,576 for each alone; IL-21 with B cells and T follicular helper cells shown as well covered."},note:"A low overlap can be a real gap, different wording, or little interest. It is a prompt to look, not a finding.",link:{to:"/knowledge-graph",label:"How the graph records gaps"}},
 {id:"workspace",tag:"Preview · model checks are switched on per deployment",title:"Investigate with proof.",points:["Retrieval from Europe PMC, OpenAlex and Open Targets. A failed source is shown as failed, never as nothing found.","Two models check the direction of the best claims and must quote the passage. If they disagree or cannot tell, the claim stays unresolved.","Hypotheses are proposed only from agreed findings, challenged by a second model, and labelled unvalidated."],
  shot:{name:"workspace",w:1172,h:1480,alt:"The investigation workspace after a live run: 46 sources, 21 candidates and 2 key findings; evidence filters, a relationship map around IL-21, and a verification panel quoting the passage behind a positive finding that microRNA-155 increases IL-21 mediated STAT3 signalling in lupus."},note:"Screenshot from a run with model checks enabled. Everything stays candidate-only and unreviewed.",link:{to:"/research/workspace",label:"Open the workspace"}},
];

export function StoryRows(){
 return (
  <section className="ps-rows" aria-labelledby="ps-rows-h">
   <h2 id="ps-rows-h" className="ps-h2">What a researcher does here.</h2>
   {ROWS.map((r,i)=>(
    <article key={r.id} className="ps-row" data-flip={i%2===1} id={"story-"+r.id}>
     <div className="ps-text"><span className="ps-tag">{r.tag}</span><h3>{r.title}</h3><ul>{r.points.map(p=><li key={p}>{p}</li>)}</ul><p className="ps-note">{r.note}</p><Link className="ps-link" to={r.link.to}>{r.link.label} <span aria-hidden="true">→</span></Link></div>
     <figure className="ps-fig"><Shot {...r.shot}/></figure>
    </article>))}
  </section>
 );
}

export function StoryStart(){
 return (
  <section className="ps-start" aria-labelledby="ps-start-h">
   <div className="ps-text"><span className="ps-tag">Two minutes, every step optional</span><h2 id="ps-start-h" className="ps-h2">Start with what you work on.</h2>
    <ul><li>Say what you are researching, add topics, genes or diseases.</li><li>Optionally add your ORCID iD or paste DOIs and PubMed IDs, so HSI can find your own papers.</li><li>Choose light or dark and an accent colour. No health information is asked for.</li></ul>
    <p className="ps-note">Everything is saved on this device. Account storage and email updates are not available yet, and the page says so.</p>
    <Link className="sp-button" to="/welcome">Set up your research home <span aria-hidden="true">→</span></Link></div>
   <figure className="ps-fig"><Shot name="welcome" w={1200} h={860} alt="The set-up page, step two of four: a box for your research question and a field to add topics such as IL-21 and systemic sclerosis."/></figure>
  </section>
 );
}

const MARK:Record<string,string>={yes:"Yes",part:"Partly",no:"No",var:"Varies"};
const CMP:[string,string,string,string,string][]=[
 ["Every claim keeps its source, context and review status","var","var","var","yes"],
 ["Says when it cannot tell, and shows the disagreement","var","no","var","yes"],
 ["Alerts on new papers for your topics","no","yes","yes","yes"],
 ["Gap signal with the counts and the search shown","part","part","var","yes"],
 ["Briefs you can export, with their limits stated","var","no","var","yes"],
 ["Licensed full text and proprietary relationships at scale","var","no","yes","no"],
];
export function StoryCompare(){
 return (
  <section className="ps-compare" aria-labelledby="ps-cmp-h">
   <h2 id="ps-cmp-h" className="ps-h2">Where HSI fits.</h2>
   <p className="ps-sub">HSI is built on open sources, so it is deliberately narrower than licensed enterprise platforms and stricter about what it will claim. Categories, not products; capabilities vary within each, and this reflects public descriptions in November 2026.</p>
   <div className="ps-tablewrap" role="region" aria-label="Comparison table, scrolls sideways on narrow screens" tabIndex={0}><table><caption className="sp-sr">Capabilities by type of tool</caption>
    <thead><tr><th scope="col">Capability</th><th scope="col">Answer engines</th><th scope="col">Alert and discovery tools</th><th scope="col">Enterprise knowledge graphs</th><th scope="col">HSI today</th></tr></thead>
    <tbody>{CMP.map(r=><tr key={r[0]}><th scope="row">{r[0]}</th>{r.slice(1).map((c,i)=><td key={i} data-m={c}>{MARK[c]}</td>)}</tr>)}</tbody></table></div>
   <p className="ps-note">HSI does not have licensed full text, patents or a proprietary graph at the scale of enterprise platforms, and has no customers, benchmarks or accuracy figures to show yet.</p>
  </section>
 );
}
