import {useState} from "react";
import {
 DOMAINS,INTEREST_KINDS,SYNTHETIC_PUBLICATIONS,looksIdentifying,parseOrcidForDisplay,type DomainKey,
} from "../../../../src/onboarding/scientificOnboarding";
import {ATLAS_DOMAINS} from "../components/atlas/atlasData";
import {AtlasTerritory} from "../components/atlas/AtlasArt";
import {OnboardingShell} from "./Shell";
import {Chip,FieldError,Note,Status,TextField} from "./ui";
import {useOnboarding} from "./store";

const MODES=[
 {id:"manual" as const,label:"Build it by hand",note:"Type what you want HSI to know. Nothing is inferred."},
 {id:"orcid" as const,label:"Add your ORCID iD",note:"Typed and checked for a valid format. Not verified with ORCID."},
 {id:"publications" as const,label:"Preview a publication import",note:"Shows how imported works would look, using sample records."},
 {id:"cv" as const,label:"Preview a CV upload",note:"Records the file name only. The file is not read or uploaded."},
];
const DEPARTMENTS=["Immunology","Neuroscience","Microbiology","Genetics and genomics","Biochemistry","Cell biology","Computational biology","Clinical medicine","Pharmacology","Bioengineering"];

export function Identity(){
 const [s,d]=useOnboarding();
 const id=s.identity,set=(patch:Partial<typeof id>)=>d({type:"setIdentity",patch});
 const orcid=parseOrcidForDisplay(id.orcid);
 return (
  <OnboardingShell step="identity" eyebrow="Your scientific identity" title="Let HSI know who is asking." lede="All optional. HSI never invents publications, affiliations or qualifications; the proposed profile shows only what you enter.">
   <div className="ob-two">
    <div>
     <div role="radiogroup" aria-label="How to build your profile" className="ob-modes">
      {MODES.map(m=>(
       <button key={m.id} type="button" role="radio" aria-checked={id.mode===m.id} className="ob-mode" data-on={id.mode===m.id} onClick={()=>set({mode:id.mode===m.id?null:m.id})}>
        <span className="ob-role-name">{m.label}</span><span className="ob-role-blurb">{m.note}</span>
       </button>
      ))}
     </div>
     <div className="ob-form">
      <TextField name="name" label="Name" optional value={id.name} onChange={v=>set({name:v})} autoComplete="name" maxLength={120}/>
      <TextField name="institution" label="Institution" optional value={id.institution} onChange={v=>set({institution:v})} autoComplete="organization"/>
      <TextField name="department" label="Department" optional value={id.department} onChange={v=>set({department:v})} list="ob-departments" hint="Start typing, or choose a suggestion."/>
      <datalist id="ob-departments">{DEPARTMENTS.map(x=><option key={x} value={x}/>)}</datalist>
      {id.mode==="orcid"&&<TextField name="orcid" label="ORCID iD" value={id.orcid} onChange={v=>set({orcid:v})} hint="For example 0000-0002-1825-0097. Authenticated ORCID sign-in is planned."/>}
     </div>
     {id.mode==="publications"&&(
      <section className="ob-panel" aria-labelledby="ob-pub">
       <h2 id="ob-pub" className="ob-h3">Publication import preview <Status s="Illustrative"/></h2>
       <p className="ob-hint">Live import from ORCID or OpenAlex is not connected. These are sample records so you can see the layout. They are not your publications.</p>
       {id.publicationsPreviewed
        ?<ul className="ob-pubs">{SYNTHETIC_PUBLICATIONS.map(p=><li key={p.id}><span className="ob-pill">Sample</span> {p.title}<span className="ob-hint"> · {p.venue}, {p.year}</span></li>)}</ul>
        :<button type="button" className="ob-btn ob-btn-quiet" onClick={()=>set({publicationsPreviewed:true})}>Show sample records</button>}
       {id.publicationsPreviewed&&<button type="button" className="ob-link" onClick={()=>set({publicationsPreviewed:false})}>Hide sample records</button>}
      </section>
     )}
     {id.mode==="cv"&&(
      <section className="ob-panel" aria-labelledby="ob-cv">
       <h2 id="ob-cv" className="ob-h3">CV upload preview <Status s="Planned"/></h2>
       <p className="ob-hint">CV parsing is not connected. Choosing a file records its name here and nothing else: it is not read, uploaded or stored.</p>
       <label className="ob-file"><span className="ob-btn ob-btn-quiet">Choose a file</span>
        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e=>set({cvFileName:e.target.files?.[0]?.name.slice(0,120)??""})}/>
       </label>
       {id.cvFileName&&<p className="ob-hint">Selected: {id.cvFileName}. <button type="button" className="ob-link" onClick={()=>set({cvFileName:""})}>Clear</button></p>}
      </section>
     )}
    </div>
    <aside className="ob-proposed" aria-labelledby="ob-prop">
     <h2 id="ob-prop" className="ob-h3">Proposed profile</h2>
     <p className="ob-hint">Editable on the left. Empty fields stay empty.</p>
     <dl>
      <div><dt>Name</dt><dd>{id.name||<em>Not provided</em>}</dd></div>
      <div><dt>Institution</dt><dd>{id.institution||<em>Not provided</em>}</dd></div>
      <div><dt>Department</dt><dd>{id.department||<em>Not provided</em>}</dd></div>
      <div><dt>ORCID iD</dt><dd>{orcid?<>{orcid} <span className="ob-pill">Not verified</span></>:<em>Not provided</em>}</dd></div>
      <div><dt>Publications</dt><dd><em>None imported</em></dd></div>
     </dl>
    </aside>
   </div>
  </OnboardingShell>
 );
}

function DomainCard({k,index}:{k:DomainKey;index:number}){
 const [s,d]=useOnboarding();
 const meta=DOMAINS.find(x=>x.key===k)!,art=ATLAS_DOMAINS.find(x=>x.key===k)!;
 const primary=s.primaryDomain===k,secondary=s.secondaryDomains.includes(k);
 return (
  <li className="ob-domain" data-primary={primary} data-secondary={secondary}>
   <svg viewBox="0 0 370 300" aria-hidden="true" focusable="false"><AtlasTerritory d={{...art,x:0,y:0}} index={index} dimmed={false}/></svg>
   <div className="ob-domain-body">
    <h3 className="ob-domain-name">{meta.label}</h3>
    <p className="ob-hint">{meta.example}</p>
    <div className="ob-domain-actions" role="group" aria-label={meta.label}>
     <Chip role="radio" on={primary} onClick={()=>d({type:"setPrimaryDomain",domain:k})}>Primary</Chip>
     <Chip on={secondary} disabled={primary} onClick={()=>d({type:"toggleSecondaryDomain",domain:k})}>Also interested</Chip>
    </div>
   </div>
  </li>
 );
}

export function Science(){
 const [s,d]=useOnboarding();
 const [kind,setKind]=useState<(typeof INTEREST_KINDS)[number]>("Gene");
 const [name,setName]=useState("");
 const add=()=>{if(name.trim()){d({type:"addInterest",kind,name});setName("")}};
 return (
  <OnboardingShell step="science" wide eyebrow="Your scientific territory" title="Where does your science live?" lede="Six domains, equally weighted. Pick one as your primary and add any others you work across.">
   <ul className="ob-domains" aria-label="Scientific domains">{DOMAINS.map((x,i)=><DomainCard key={x.key} k={x.key} index={i}/>)}</ul>
   <FieldError name="primaryDomain"/>
   <section className="ob-interests" aria-labelledby="ob-int">
    <h2 id="ob-int" className="ob-h3">Specific interests <span className="ob-optional">(optional)</span></h2>
    <p className="ob-hint">Genes, proteins, cells, tissues, pathways, diseases or processes you follow.</p>
    <form className="ob-inline" onSubmit={e=>{e.preventDefault();add()}}>
     <label className="ob-field ob-field-sm"><span>Type</span>
      <select value={kind} onChange={e=>setKind(e.target.value as typeof kind)}>{INTEREST_KINDS.map(k=><option key={k}>{k}</option>)}</select>
     </label>
     <label className="ob-field ob-field-grow"><span>Name</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder="For example IL-10, butyrate, microglia"/></label>
     <button type="submit" className="ob-btn ob-btn-quiet">Add</button>
    </form>
    {s.interests.length>0&&<ul className="ob-tags" aria-label="Your interests">{s.interests.map((i,n)=><li key={i.kind+i.name}><span className="ob-pill">{i.kind}</span> {i.name}<button type="button" aria-label={`Remove ${i.name}`} onClick={()=>d({type:"removeInterest",index:n})}>×</button></li>)}</ul>}
   </section>
   <Note>The domain pictures are illustrative. HSI does not yet claim coverage of every topic in a domain.</Note>
  </OnboardingShell>
 );
}

export {looksIdentifying};
