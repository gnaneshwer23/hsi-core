import {useState,type ReactNode} from "react";
import {Link} from "../router";
import {Logo} from "../components/site/Header";
import {STATUS_META,type AtlasStatus} from "../components/atlas/atlasData";
import {PERSONA_LABEL,type PersonaId} from "../../../../src/onboarding/scientificOnboarding";
import {PREVIEW_PERSONAS,previewPath,type OrderedPanel,type ProfileView} from "../../../../src/onboarding/workspacePreview";
import "./workspace.css";

export function EvidenceTag({s}:{s:AtlasStatus}){
 const m=STATUS_META[s];
 return <span className="ws-tag" style={{color:m.colour}}><i aria-hidden="true" style={{background:m.colour}}/>{m.short}</span>;
}

export function Panel({id,title,matched,children}:{id:string;title:string;matched?:string[];children:ReactNode}){
 return (
  <section id={id} className="ws-panel" aria-labelledby={`${id}-h`} data-emphasised={!!matched?.length}>
   <header><h2 id={`${id}-h`}>{title}</h2>{!!matched?.length&&<span className="ws-match">Matches your goal: {matched.join(", ")}</span>}</header>
   {children}
  </section>
 );
}

/** A wide table scrolls inside a focusable region, so keyboard users can reach every column. */
export function ScrollTable({children}:{children:ReactNode}){
 return <div className="ws-scroll" tabIndex={0} role="region" aria-label="Data table, scrolls sideways">{children}</div>;
}

export type Illustrative={title:string;blocks:{h:string;items:string[]}[]};

/** The first meaningful action. The output is written for the demonstration; it is not produced by HSI from evidence. */
export function FirstAction({label,question,output}:{label:string;question:string;output:Illustrative}){
 const [open,setOpen]=useState(false);
 return (
  <section className="ws-first" aria-labelledby="ws-first-h">
   <p className="ws-eyebrow">Your first action</p>
   <h2 id="ws-first-h">{label}</h2>
   {question&&<p className="ws-sub">Starting from your question: “{question}”. The example below uses a different, illustrative question.</p>}
   <button type="button" className="ws-btn ws-btn-primary" aria-expanded={open} aria-controls="ws-first-out" onClick={()=>setOpen(!open)}>{open?"Hide the illustrative output":"Show an illustrative output"}</button>
   {open&&(
    <div id="ws-first-out" className="ws-out">
     <p className="ws-badge">Illustrative output · not produced by HSI from evidence · no live service was called</p>
     <h3>{output.title}</h3>
     {output.blocks.map(b=><div key={b.h}><h4>{b.h}</h4><ul>{b.items.map(i=><li key={i}>{i}</li>)}</ul></div>)}
    </div>
   )}
  </section>
 );
}

export function WorkspaceFrame({persona,profile,panels,children,variant}:{persona:PersonaId|null;profile:ProfileView|null;panels:OrderedPanel[];children:ReactNode;variant?:string}){
 return (
  <div className="lv2 lv2-ed ws" data-persona={persona??"chooser"}>
   <a href="#ws-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to the workspace</a>
   <header className="ws-top">
    <Logo/>
    <nav aria-label="Workspace previews" className="ws-switch">
     <label><span className="sr-only">Switch workspace preview</span>
      <select value={persona??""} onChange={e=>{window.location.assign(previewPath((e.target.value||undefined) as PersonaId|undefined))}}>
       <option value="">All previews</option>
       {PREVIEW_PERSONAS.map(p=><option key={p} value={p}>{PERSONA_LABEL[p]}</option>)}
      </select>
     </label>
     <Link to="/settings/scientific-profile" className="ws-link">Profile settings</Link>
    </nav>
   </header>
   <div className="ws-banner" role="note"><strong>Illustrative preview.</strong> Sample content, not your data. No live service is connected, nothing is saved to a server, and this view grants no access.{profile&&<> {profile.note}</>}</div>
   <div className={panels.length?"ws-shell":"ws-shell ws-shell-solo"}>
    {panels.length>0&&(
     <nav className="ws-nav" aria-label="Sections">
      <p className="ws-eyebrow">{persona?PERSONA_LABEL[persona]:""}{variant?` · ${variant}`:""}</p>
      <ul>{panels.map(p=><li key={p.key}><a href={`#${p.key}`}>{p.title}{p.emphasised&&<span className="ws-dot" title="Matches your goals"><span className="sr-only"> (matches your goals)</span></span>}</a></li>)}</ul>
     </nav>
    )}
    <main id="ws-main" className="ws-main" tabIndex={-1}>{children}</main>
   </div>
  </div>
 );
}
