import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import "../styles/science-body.css";
type Study={pmid:string;doi:string;sourceUrl:string;accessLevel:string;population:{ssc:number|null;healthyControls:number|null;notes:string};methods:{phenotyping:string;functional:string;sourceLocator:string};quantitativeFindings:{measure:string;ssc:string;control:string|null;p:string;locator:string}[];interpretation:string;limitations:string[]};
type Comparison={id:string;status:string;comparison:string;additionalFinding:string;unresolved:string[];classification:string};
type Extraction={scope:string;status:string;humanReviewed:boolean;graphPromotable:boolean;studies:Study[];comparisons:Comparison[]};
export function ScienceStudyComparison(){
 const [data,setData]=useState<Extraction|null>(null);
 const [error,setError]=useState("");
 const [active,setActive]=useState<string|null>(null);
 useEffect(()=>{const controller=new AbortController();fetch("/research/ssc-tfh-il21-study-extraction.v1.json",{signal:controller.signal})
 .then(r=>{if(!r.ok)throw new Error("Study data unavailable");return r.json() as Promise<Extraction>})
 .then(d=>{if(!Array.isArray(d.studies)||d.humanReviewed!==false||d.graphPromotable!==false)throw new Error("Unrecognised study review state");setData(d);})
 .catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Unable to load study data")});
 return()=>controller.abort();},[]);
 return <main className="science-body"><header className="science-body-hero"><div className="science-body-wrap">
 <p className="science-body-kicker">HSI / ISI / INVESTIGATION 01</p><h1>Compare the evidence.<br/><em>Keep the context.</em></h1>
 <p>Systemic sclerosis · Tfh–IL-21–B-cell interactions. A read-only scientific comparison of source-grounded draft extractions. Not an approved mechanism or clinical interpretation.</p>
 <div className="science-body-actions"><Link to="/science/literature">Explore publications ↗</Link><Link to="/science/contradictions">Research contradictions ↗</Link></div>
 </div></header><section className="science-body-wrap" style={{paddingBlock:"3rem"}}>
 {error&&<p role="alert">{error}. No scientific conclusions are available.</p>}
 {!data&&!error&&<p role="status">Loading study comparison…</p>}
 {data&&<><p className="science-body-review"><strong>Draft / independent review pending.</strong> Source-access levels vary. Quantitative findings are displayed only where extracted; unavailable data are not inferred. Graph publication is blocked.</p>
 <h2>Study-by-study comparison</h2>
 <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:"650px",textAlign:"left"}}>
 <thead><tr><th scope="col">Study</th><th scope="col">Population</th><th scope="col">Phenotyping</th><th scope="col">Evidence access</th></tr></thead>
 <tbody>{data.studies.map(s=><tr key={s.pmid} style={{borderTop:"1px solid #9ba5b2",verticalAlign:"top"}}>
 <td style={{padding:"1rem"}}><a href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`} target="_blank" rel="noreferrer">PMID {s.pmid}</a></td>
 <td style={{padding:"1rem"}}>{s.population.ssc??"Not extracted"} SSc / {s.population.healthyControls??"Not extracted"} controls<br/><small>{s.population.notes}</small></td>
 <td style={{padding:"1rem"}}>{s.methods.phenotyping}</td><td style={{padding:"1rem"}}>{s.accessLevel.replaceAll("_"," ")}</td></tr>)}</tbody></table></div>
 <h2 style={{marginTop:"2.5rem"}}>Evidence dossiers</h2>
 <div style={{display:"grid",gap:"1rem"}}>{data.studies.map(s=><article key={s.pmid} style={{border:"1px solid #9ba5b2",borderRadius:"0.75rem",padding:"1.25rem"}}>
 <p className="science-body-kicker">PMID {s.pmid} · {s.accessLevel.replaceAll("_"," ").toUpperCase()}</p>
 <h3>{s.interpretation}</h3>
 <button type="button" aria-expanded={active===s.pmid} onClick={()=>setActive(active===s.pmid?null:s.pmid)}>{active===s.pmid?"Hide":"View"} study details</button>
 {active===s.pmid&&<div><h4>Methods</h4><p>{s.methods.functional}</p><p>Locator: {s.methods.sourceLocator}</p>
 <h4>Quantitative findings</h4>{s.quantitativeFindings.length?<ul>{s.quantitativeFindings.map((f,i)=><li key={i}>{f.measure}: SSc {f.ssc}; comparison {f.control??"not extracted"}; p={f.p} ({f.locator})</li>)}</ul>:<p>No quantitative values extracted from accessible sources.</p>}
 <h4>Limitations</h4><ul>{s.limitations.map((l,i)=><li key={i}>{l}</li>)}</ul>
 <a href={s.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a></div>}
 </article>)}</div>
 <h2 style={{marginTop:"2.5rem"}}>Unresolved comparison</h2>{data.comparisons.map(c=><article key={c.id} style={{border:"1px solid #9ba5b2",borderRadius:"0.75rem",padding:"1.25rem"}}>
 <p className="science-body-kicker">{c.classification.replaceAll("_"," ").toUpperCase()}</p><p>{c.comparison}</p><p>{c.additionalFinding}</p><h3>Required scientific checks</h3><ul>{c.unresolved.map((u,i)=><li key={i}>{u}</li>)}</ul>
 <p><strong>Conclusion:</strong> Not adjudicated. Independent qualified reviewer required.</p>
 </article>)}
 </>}
 </section></main>;
}
