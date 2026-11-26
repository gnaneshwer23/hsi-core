import {useEffect,useMemo,useState} from "react";
import {Link} from "../router";
import {Logo} from "../components/site/Header";
import {applySeo} from "../../lib/seo/applySeo";
import {
 COMPUTATIONAL_METHODS,CONNECTIONS,DATASET_KINDS,DOMAINS,EVIDENCE_TYPES,EXPLANATION_LEVELS,INTEREST_KINDS,MODEL_SYSTEMS,OBJECTIVES,ROLES,TECHNIQUES,
 deriveWorkspacePlan,parseOrcidForDisplay,personaOf,roleById,type DomainKey,type Memory,type Sharing,
} from "../../../../src/onboarding/scientificOnboarding";
import {CONTRACTS,findAccessFields,prepareSubmission} from "../../../../src/onboarding/integrationContracts";
import {orderPanels,previewPath} from "../../../../src/onboarding/workspacePreview";
import {Chip,Status} from "../onboarding/ui";
import {useOnboarding} from "../onboarding/store";
import "../onboarding/onboarding.css";
import "../workspace/workspace.css";
import "./settings.css";

const SECTIONS=[
 ["summary","Overview"],["role","Role"],["science","Domains and interests"],["objectives","Objectives"],["expertise","Methods and expertise"],["publications","Publications"],
 ["projects","Projects"],["memory","Memory and sharing"],["connections","External connections"],["why","Why you see what you see"],["data","What would be sent"],
] as const;

function Section({id,title,children,hint}:{id:string;title:string;hint?:string;children:React.ReactNode}){
 return <section id={id} className="ws-panel" aria-labelledby={`${id}-h`}><header><h2 id={`${id}-h`}>{title}</h2></header>{hint&&<p className="ws-sub st-hint">{hint}</p>}{children}</section>;
}

export default function ScientificProfile(){
 const [s,d]=useOnboarding();
 const [interest,setInterest]=useState("");const [kind,setKind]=useState<(typeof INTEREST_KINDS)[number]>("Gene");
 const [pName,setPName]=useState("");const [pNote,setPNote]=useState("");
 const [confirmReset,setConfirmReset]=useState(false);
 useEffect(()=>{applySeo("/settings/scientific-profile")},[]);

 const persona=personaOf(s);
 const plan=useMemo(()=>deriveWorkspacePlan(s),[s]);
 const submission=useMemo(()=>prepareSubmission(s),[s]);
 const panels=persona?orderPanels(persona,s.primaryRole,s.objectives):[];
 const orcid=parseOrcidForDisplay(s.identity.orcid);
 const toggle=(group:"techniques"|"computational"|"modelSystems"|"datasets"|"evidence",v:string)=>d({type:"toggleMethod",group,value:v});
 const hasAnswers=!!s.primaryRole||s.objectives.length>0||!!s.primaryDomain;
 const preview=submission.ok?JSON.stringify({profile:submission.profile,extension:submission.extension},null,2):"";
 const download=()=>{
  if(!submission.ok)return;
  const url=URL.createObjectURL(new Blob([preview],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download="hsi-scientific-profile.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const effectiveSharing:Record<Sharing,string>={private:"Private to you",group:"Private to you. No research group is provisioned for you.",institution:"Private to you. No institutional access is provisioned for you."};

 return (
  <div className="lv2 ws st" data-persona="settings">
   <a href="#st-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to your profile</a>
   <header className="ws-top"><Logo/><nav className="ws-switch" aria-label="Profile navigation"><Link to={previewPath(persona??undefined)} className="ws-link">Workspace preview</Link><Link to="/onboarding" className="ws-link">Run setup again</Link></nav></header>
   <div className="ws-banner" role="note"><strong>Stored on this device only.</strong> Changes here are saved in this browser. Nothing is sent, verified or shared, and nothing on this page grants access.</div>
   <div className="ws-shell">
    <nav className="ws-nav" aria-label="Sections"><p className="ws-eyebrow">Scientific profile</p><ul>{SECTIONS.map(([id,t])=><li key={id}><a href={`#${id}`}>{t}</a></li>)}</ul></nav>
    <main id="st-main" className="ws-main" tabIndex={-1}>
     <p className="ws-eyebrow">Settings</p>
     <h1 className="ws-title">Your scientific profile</h1>
     <p className="ws-lede">Change what HSI knows about your work at any time. Every recommendation can be traced to something you told it.</p>

     <Section id="summary" title="Overview">
      {hasAnswers?(
       <dl className="ws-dl">
        <div><dt>Role</dt><dd>{s.primaryRole?roleById[s.primaryRole].label:"Not chosen"}</dd></div>
        <div><dt>Primary domain</dt><dd>{s.primaryDomain?DOMAINS.find(x=>x.key===s.primaryDomain)!.label:"Not chosen"}</dd></div>
        <div><dt>Objectives</dt><dd>{s.objectives.length}</dd></div>
        <div><dt>Setup</dt><dd>{s.done?"Finished on this device":"Not finished"}</dd></div>
       </dl>
      ):<p className="ws-note">You have not set anything up yet. <Link to="/onboarding" className="ws-link">Start setup</Link>, or fill in the sections below.</p>}
     </Section>

     <Section id="role" title="Role" hint="Personalisation only. Changing your role does not change what you can access.">
      <div role="radiogroup" aria-label="Primary role" className="st-grid">
       {ROLES.map(r=><button key={r.id} type="button" role="radio" aria-checked={s.primaryRole===r.id} className="ob-mode" data-on={s.primaryRole===r.id} onClick={()=>d({type:"setPrimaryRole",role:r.id})}><span className="ob-role-name">{r.label}</span></button>)}
      </div>
      {s.primaryRole&&<fieldset className="ob-group st-gap"><legend>Also describes me</legend><div className="ob-chips">{ROLES.filter(r=>r.id!==s.primaryRole).map(r=><Chip key={r.id} on={s.secondaryRoles.includes(r.id)} onClick={()=>d({type:"toggleSecondaryRole",role:r.id})}>{r.label}</Chip>)}</div></fieldset>}
     </Section>

     <Section id="science" title="Domains and interests">
      <fieldset className="ob-group"><legend>Primary domain</legend><div className="ob-chips" role="radiogroup" aria-label="Primary domain">{DOMAINS.map(x=><Chip key={x.key} role="radio" on={s.primaryDomain===x.key} onClick={()=>d({type:"setPrimaryDomain",domain:x.key})}>{x.label}</Chip>)}</div></fieldset>
      <fieldset className="ob-group st-gap"><legend>Also interested in</legend><div className="ob-chips">{DOMAINS.map(x=><Chip key={x.key} on={s.secondaryDomains.includes(x.key as DomainKey)} disabled={s.primaryDomain===x.key} onClick={()=>d({type:"toggleSecondaryDomain",domain:x.key})}>{x.label}</Chip>)}</div></fieldset>
      <form className="ws-inline st-gap" onSubmit={e=>{e.preventDefault();if(interest.trim()){d({type:"addInterest",kind,name:interest});setInterest("")}}}>
       <label className="ws-field"><span>Add an interest</span><span className="st-row"><select aria-label="Type" value={kind} onChange={e=>setKind(e.target.value as typeof kind)}>{INTEREST_KINDS.map(k=><option key={k}>{k}</option>)}</select><input aria-label="Name" value={interest} onChange={e=>setInterest(e.target.value)} maxLength={80} placeholder="For example IL-10"/></span></label>
       <button type="submit" className="ws-btn">Add</button>
      </form>
      {s.interests.length>0&&<ul className="ob-tags" aria-label="Your interests">{s.interests.map((i,n)=><li key={i.kind+i.name}><span className="ob-pill">{i.kind}</span> {i.name}<button type="button" aria-label={`Remove ${i.name}`} onClick={()=>d({type:"removeInterest",index:n})}>×</button></li>)}</ul>}
     </Section>

     <Section id="objectives" title="Objectives">
      <div className="ob-chips">{OBJECTIVES.map(o=><Chip key={o.id} on={s.objectives.includes(o.id)} onClick={()=>d({type:"toggleObjective",id:o.id})}>{o.label}</Chip>)}</div>
      <label className="ws-field st-gap"><span>Current research question</span><input value={s.question} maxLength={500} onChange={e=>d({type:"set",patch:{question:e.target.value}})}/></label>
     </Section>

     <Section id="expertise" title="Methods and expertise" hint="Correct anything HSI has recorded. Leave blank what you would rather not say.">
      <label className="ws-field"><span>Areas of expertise</span><input value={s.methods.expertise} maxLength={200} onChange={e=>d({type:"setMethods",patch:{expertise:e.target.value}})}/></label>
      {([["Experimental techniques","techniques",TECHNIQUES],["Computational methods","computational",COMPUTATIONAL_METHODS],["Model systems","modelSystems",MODEL_SYSTEMS],["Kinds of data","datasets",DATASET_KINDS],["Preferred evidence","evidence",EVIDENCE_TYPES]] as const).map(([label,key,list])=>(
       <fieldset key={key} className="ob-group st-gap"><legend>{label}</legend><div className="ob-chips">{(list as readonly string[]).map(v=><Chip key={v} on={(s.methods[key] as string[]).includes(v)} onClick={()=>toggle(key,v)}>{v}</Chip>)}</div></fieldset>
      ))}
      <fieldset className="ob-group st-gap"><legend>Explanation level</legend><div className="ob-chips" role="radiogroup" aria-label="Explanation level">{EXPLANATION_LEVELS.map(l=><Chip key={l.id} role="radio" on={s.methods.level===l.id} onClick={()=>d({type:"setMethods",patch:{level:s.methods.level===l.id?null:l.id}})}>{l.label}</Chip>)}</div></fieldset>
     </Section>

     <Section id="publications" title="Publications" hint="Nothing has been imported. HSI never adds publications you did not provide.">
      <p className="ws-note">Imported publications: <strong>none</strong>. Import from ORCID or OpenAlex is planned and needs a verified account. <Status s="Planned"/></p>
      <label className="ws-field"><span>ORCID iD (format-checked, not verified)</span><input value={s.identity.orcid} onChange={e=>d({type:"setIdentity",patch:{orcid:e.target.value}})} aria-describedby="st-orcid"/></label>
      <p id="st-orcid" className="ws-sub">{!s.identity.orcid.trim()?"Not provided.":orcid?`Valid format: ${orcid}. Not verified with ORCID.`:"That is not a valid ORCID iD."}</p>
      {s.identity.publicationsPreviewed&&<p className="ws-sub">A sample-record preview was viewed during setup. <button type="button" className="ob-link" onClick={()=>d({type:"setIdentity",patch:{publicationsPreviewed:false}})}>Clear it</button></p>}
      {s.identity.cvFileName&&<p className="ws-sub">CV file name noted: {s.identity.cvFileName}. The file was never read. <button type="button" className="ob-link" onClick={()=>d({type:"setIdentity",patch:{cvFileName:""}})}>Clear it</button></p>}
     </Section>

     <Section id="projects" title="Projects" hint="Local labels to organise your investigations. Not shared and not saved to a server.">
      <form className="ws-form" onSubmit={e=>{e.preventDefault();d({type:"addProject",name:pName,note:pNote});setPName("");setPNote("")}}>
       <label className="ws-field"><span>Project name</span><input value={pName} onChange={e=>setPName(e.target.value)} maxLength={80}/></label>
       <label className="ws-field"><span>Note (optional)</span><input value={pNote} onChange={e=>setPNote(e.target.value)} maxLength={200}/></label>
       <button type="submit" className="ws-btn" disabled={!pName.trim()}>Add project</button>
      </form>
      {s.projects.length>0?<ul className="ws-rows">{s.projects.map((p,i)=><li key={p.name}><strong>{p.name}</strong>{p.note&&<span>{p.note}</span>}<button type="button" className="ob-link" onClick={()=>d({type:"removeProject",index:i})} aria-label={`Remove ${p.name}`}>Remove</button></li>)}</ul>:<p className="ws-sub">No projects.</p>}
     </Section>

     <Section id="memory" title="Memory and sharing" hint="Preferences. The backend decides what is effective, and today none of these take effect because no account is connected.">
      <fieldset className="ob-group"><legend>Scientific memory</legend><div className="ob-chips" role="radiogroup" aria-label="Scientific memory">{(["off","private","project"] as Memory[]).map(m=><Chip key={m} role="radio" on={s.privacy.memory===m} onClick={()=>d({type:"setPrivacy",patch:{memory:m}})}>{{off:"Off",private:"Private memory",project:"Project memory"}[m]}</Chip>)}</div></fieldset>
      <fieldset className="ob-group st-gap"><legend>Sharing preference</legend><div className="ob-chips" role="radiogroup" aria-label="Sharing preference">{(["private","group","institution"] as Sharing[]).map(m=><Chip key={m} role="radio" on={s.privacy.sharing===m} onClick={()=>d({type:"setPrivacy",patch:{sharing:m}})}>{{private:"Private",group:"Authorised group",institution:"Institution"}[m]}</Chip>)}</div></fieldset>
      <fieldset className="ob-group st-gap"><legend>Weekly summary</legend><div className="ob-chips" role="radiogroup" aria-label="Weekly summary">{(["off","weekly"] as const).map(m=><Chip key={m} role="radio" on={s.privacy.notifications===m} onClick={()=>d({type:"setPrivacy",patch:{notifications:m}})}>{m==="off"?"None":"Weekly"}</Chip>)}</div></fieldset>
      <fieldset className="ob-group st-gap"><legend>External connections</legend><div className="ob-chips" role="radiogroup" aria-label="External connections">{(["ask","never"] as const).map(m=><Chip key={m} role="radio" on={s.privacy.external===m} onClick={()=>d({type:"setPrivacy",patch:{external:m}})}>{m==="ask"?"Ask each time":"Never connect"}</Chip>)}</div></fieldset>
      <h3 className="ws-h3">Sharing permissions, inspected</h3>
      <div className="ws-scroll" tabIndex={0} role="region" aria-label="Sharing permissions, scrolls sideways"><table className="ws-table"><thead><tr><th scope="col">What</th><th scope="col">Your preference</th><th scope="col">Effective today</th></tr></thead><tbody>
       <tr><th scope="row">Sharing</th><td>{{private:"Private",group:"Authorised group",institution:"Institution"}[s.privacy.sharing]}</td><td>{effectiveSharing[s.privacy.sharing]}</td></tr>
       <tr><th scope="row">Memory</th><td>{{off:"Off",private:"Private memory",project:"Project memory"}[s.privacy.memory]}</td><td>Nothing is retained: no account is connected.</td></tr>
       <tr><th scope="row">Research group access</th><td>Not applicable</td><td>Not provisioned</td></tr>
       <tr><th scope="row">Institutional access</th><td>Not applicable</td><td>Not provisioned</td></tr>
      </tbody></table></div>
     </Section>

     <Section id="connections" title="External connections" hint="Nothing is connected. Marking interest records a preference on this device.">
      <ul className="ws-rows">{CONNECTIONS.map(c=><li key={c.id}><strong>{c.label} <Status s={c.status}/></strong><span>{{public:"Public metadata",private:"Private to you",restricted:"Restricted data"}[c.dataClass]}. {c.what}</span><Chip on={!!s.connections[c.id]} onClick={()=>d({type:"toggleConnection",id:c.id})}>{s.connections[c.id]?"Interested ✓":"I would use this"}</Chip></li>)}</ul>
      <p className="ws-sub">Connected: none.</p>
     </Section>

     <Section id="why" title="Why you see what you see" hint="Each recommendation names the answers behind it. Change an answer above and this updates.">
      {plan?<>
       <h3 className="ws-h3">Recommended tools</h3>
       <ul className="ws-rows">{plan.tools.map(t=><li key={t.id}><strong>{t.name} <Status s={t.status}/></strong><span>Because you chose: {t.because.join("; ")}.</span></li>)}</ul>
       <h3 className="ws-h3">Order of your workspace panels</h3>
       <ol className="ws-plain">{panels.map(p=><li key={p.key}>{p.title}{p.emphasised?` — matches: ${p.matched.map(m=>OBJECTIVES.find(o=>o.id===m)!.label).join(", ")}`:" — shown after your goals, in the usual order"}</li>)}</ol>
      </>:<p className="ws-sub">Choose a role, a primary domain and at least one objective to see recommendations.</p>}
     </Section>

     <Section id="data" title="What would be sent" hint="If your account were connected, this is all that would go to the profile store. It is built here, on this device, and shown so you can inspect it. Nothing has been sent.">
      {submission.ok?<>
       <pre className="st-json" tabIndex={0} aria-label="Profile payload preview">{preview}</pre>
       {submission.droppedObjectives.length>0&&<p className="ws-sub">Not carried over to the existing profile format: {submission.droppedObjectives.map(o=>OBJECTIVES.find(x=>x.id===o)!.label).join(", ")}. They stay here.</p>}
       <p className="ws-sub">Access-granting fields in this payload: {findAccessFields(submission).length===0?"none":"present (this is a bug)"}.</p>
       <div className="st-actions"><button type="button" className="ws-btn" onClick={download}>Download a copy (JSON)</button></div>
      </>:<p className="ws-note">{submission.reasons.includes("missing_required_answers")?"Choose a role and a primary domain to preview the payload.":"A free-text answer looks like personal or patient information, so nothing would be sent. Remove it and this will update."}</p>}
      <h3 className="ws-h3">Backend contracts</h3>
      <ul className="ws-rows">{CONTRACTS.map(c=><li key={c.id}><strong>{c.title} <Status s={c.status==="Planned"?"Planned":"Prototype"}/></strong><span>{c.purpose} Today: {c.today}</span></li>)}</ul>
      <div className="st-danger">
       <h3 className="ws-h3">Remove my setup from this device</h3>
       {!confirmReset?<button type="button" className="ws-btn" onClick={()=>setConfirmReset(true)}>Remove setup…</button>:<>
        <p className="ws-sub" role="alert">This clears every answer stored in this browser. It cannot be undone.</p>
        <button type="button" className="ws-btn st-btn-danger" onClick={()=>{d({type:"reset"});setConfirmReset(false)}}>Yes, remove it</button>{" "}
        <button type="button" className="ws-btn" onClick={()=>setConfirmReset(false)}>Keep it</button></>}
      </div>
     </Section>
    </main>
   </div>
  </div>
 );
}
