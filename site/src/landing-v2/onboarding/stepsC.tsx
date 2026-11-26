import {
 COMPUTATIONAL_METHODS,CONNECTIONS,DATASET_KINDS,EVIDENCE_TYPES,EXPLANATION_LEVELS,MODEL_SYSTEMS,TECHNIQUES,
 PERSONA_LABEL,looksIdentifying,methodsFocus,personaOf,rankedObjectives,type DataClass,
} from "../../../../src/onboarding/scientificOnboarding";
import {OnboardingShell} from "./Shell";
import {Chip,FieldError,Group,Note,Status} from "./ui";
import {useOnboarding} from "./store";

export function Objectives(){
 const [s,d]=useOnboarding();
 const persona=personaOf(s),{suggested,others}=rankedObjectives(persona);
 const row=(o:{id:any;label:string})=>(
  <button key={o.id} type="button" role="checkbox" aria-checked={s.objectives.includes(o.id)} className="ob-objective" data-on={s.objectives.includes(o.id)} onClick={()=>d({type:"toggleObjective",id:o.id})}>
   <span className="ob-check" aria-hidden="true">{s.objectives.includes(o.id)?"✓":""}</span>{o.label}
  </button>
 );
 const warn=looksIdentifying(s.question);
 return (
  <OnboardingShell step="objectives" eyebrow="What you want to accomplish" title="What should HSI help you do?" lede="Choose everything that applies. The tools in your workspace follow from this.">
   {suggested.length>0&&<section aria-labelledby="ob-sug"><h2 id="ob-sug" className="ob-h3">Suggested for {persona?PERSONA_LABEL[persona].toLowerCase():"you"}</h2><div className="ob-objectives" role="group" aria-label="Suggested objectives">{suggested.map(row)}</div></section>}
   <section aria-labelledby="ob-more"><h2 id="ob-more" className="ob-h3">{suggested.length?"More":"Objectives"}</h2><div className="ob-objectives" role="group" aria-label="More objectives">{others.map(row)}</div></section>
   <FieldError name="objectives"/>
   <label className="ob-field ob-question"><span>A current research question <span className="ob-optional">(optional)</span></span>
    <textarea rows={3} maxLength={500} value={s.question} onChange={e=>d({type:"set",patch:{question:e.target.value}})} placeholder="For example: does butyrate change intestinal barrier function in humans?" aria-describedby="ob-q-hint err-question"/>
    <span id="ob-q-hint" className="ob-hint">Written for a general scientific question. {500-s.question.length} characters left.</span>
    <FieldError name="question"/>
   </label>
   {warn&&<Note tone="caution">This looks like it may contain an identifier such as an email address, a number or a patient reference. Do not enter personal or patient information. HSI does not accept it in this prototype.</Note>}
  </OnboardingShell>
 );
}

export function Methods(){
 const [s,d]=useOnboarding();
 const toggle=(group:"techniques"|"computational"|"modelSystems"|"datasets"|"evidence",value:string)=>d({type:"toggleMethod",group,value});
 const block=(k:ReturnType<typeof methodsFocus>[number])=>{
  switch(k){
   case "techniques":return <Group key={k} legend="Experimental techniques">{TECHNIQUES.map(t=><Chip key={t} on={s.methods.techniques.includes(t)} onClick={()=>toggle("techniques",t)}>{t}</Chip>)}</Group>;
   case "computational":return <Group key={k} legend="Computational methods">{COMPUTATIONAL_METHODS.map(t=><Chip key={t} on={s.methods.computational.includes(t)} onClick={()=>toggle("computational",t)}>{t}</Chip>)}</Group>;
   case "evidence":return <Group key={k} legend="Preferred evidence types" hint="HSI always shows study design and flags preprints, whatever you choose.">{EVIDENCE_TYPES.map(t=><Chip key={t} on={s.methods.evidence.includes(t)} onClick={()=>toggle("evidence",t)}>{t}</Chip>)}</Group>;
   case "level":return (
    <fieldset key={k} className="ob-group"><legend>How should HSI explain things?</legend>
     <div className="ob-levels" role="radiogroup" aria-label="Explanation level">
      {EXPLANATION_LEVELS.map(l=><button key={l.id} type="button" role="radio" aria-checked={s.methods.level===l.id} className="ob-mode" data-on={s.methods.level===l.id} onClick={()=>d({type:"setMethods",patch:{level:s.methods.level===l.id?null:l.id}})}><span className="ob-role-name">{l.label}</span><span className="ob-role-blurb">{l.note}</span></button>)}
     </div>
    </fieldset>
   );
  }
 };
 return (
  <OnboardingShell step="methods" eyebrow="How you work" title="Tell HSI how you work." lede="Optional. A few taps now helps HSI explain things at the right level; you can refine this any time.">
   {methodsFocus(personaOf(s)).map(block)}
   <Group legend="Model systems">{MODEL_SYSTEMS.map(t=><Chip key={t} on={s.methods.modelSystems.includes(t)} onClick={()=>toggle("modelSystems",t)}>{t}</Chip>)}</Group>
   <Group legend="Biological datasets you work with" hint="Kinds of data only. Do not upload or describe individual records.">{DATASET_KINDS.map(t=><Chip key={t} on={s.methods.datasets.includes(t)} onClick={()=>toggle("datasets",t)}>{t}</Chip>)}</Group>
   <label className="ob-field"><span>Areas of expertise <span className="ob-optional">(optional)</span></span>
    <input value={s.methods.expertise} onChange={e=>d({type:"setMethods",patch:{expertise:e.target.value}})} maxLength={200} placeholder="For example T-cell biology, spatial transcriptomics"/>
   </label>
  </OnboardingShell>
 );
}

const CLASS_LABEL:Record<DataClass,{title:string;blurb:string}>={
 public:{title:"Public metadata",blurb:"Openly published scholarly information."},
 private:{title:"Your private documents",blurb:"Yours alone. Not accepted by this prototype."},
 restricted:{title:"Restricted research data",blurb:"Needs institutional authorisation and administrator-provisioned access."},
};

export function Resources(){
 const [s,d]=useOnboarding();
 return (
  <OnboardingShell step="resources" eyebrow="Research context" title="What could HSI connect to later?" lede="Nothing is connected today. Mark what you would want, and HSI will use it to plan which connections to build first.">
   <Note tone="caution">Do not add confidential documents or anything that identifies a patient. This prototype does not accept them, and there is no upload on this page.</Note>
   {(Object.keys(CLASS_LABEL) as DataClass[]).map(c=>(
    <section key={c} className="ob-class" data-class={c} aria-labelledby={`ob-c-${c}`}>
     <h2 id={`ob-c-${c}`} className="ob-h3">{CLASS_LABEL[c].title}</h2>
     <p className="ob-hint">{CLASS_LABEL[c].blurb}</p>
     <ul>
      {CONNECTIONS.filter(x=>x.dataClass===c).map(x=>(
       <li key={x.id}>
        <div><span className="ob-role-name">{x.label}</span> <Status s={x.status}/><span className="ob-role-blurb">{x.what}</span></div>
        <Chip on={!!s.connections[x.id]} onClick={()=>d({type:"toggleConnection",id:x.id})}>{s.connections[x.id]?"Interested ✓":"I would use this"}</Chip>
       </li>
      ))}
     </ul>
    </section>
   ))}
  </OnboardingShell>
 );
}

function Choice<T extends string>({legend,value,options,onChange,hint}:{legend:string;value:T;options:{id:T;label:string;note:string}[];onChange:(v:T)=>void;hint?:string}){
 return (
  <fieldset className="ob-group"><legend>{legend}</legend>{hint&&<p className="ob-hint">{hint}</p>}
   <div className="ob-levels" role="radiogroup" aria-label={legend}>
    {options.map(o=><button key={o.id} type="button" role="radio" aria-checked={value===o.id} className="ob-mode" data-on={value===o.id} onClick={()=>onChange(o.id)}><span className="ob-role-name">{o.label}</span><span className="ob-role-blurb">{o.note}</span></button>)}
   </div>
  </fieldset>
 );
}

export function Preferences(){
 const [s,d]=useOnboarding();
 const set=(patch:Partial<typeof s.privacy>)=>d({type:"setPrivacy",patch});
 return (
  <OnboardingShell step="preferences" eyebrow="Scientific memory and privacy" title="You decide what HSI remembers." lede="Everything starts private. These are preferences: they are saved on this device, and take effect once your account is connected.">
   <Choice legend="Scientific memory" value={s.privacy.memory} onChange={v=>set({memory:v})} options={[
    {id:"off",label:"Off",note:"HSI keeps nothing between sessions."},
    {id:"private",label:"Private memory",note:"Your questions, sources and decisions, visible only to you."},
    {id:"project",label:"Project memory",note:"Memory scoped to a project you create, private until you share it."},
   ]}/>
   <Choice legend="Sharing" value={s.privacy.sharing} onChange={v=>set({sharing:v})} hint="Group and institutional sharing need access that an administrator provisions. Choosing either records a preference only." options={[
    {id:"private",label:"Private to me",note:"The default."},
    {id:"group",label:"Authorised research group",note:"Only people your group's administrator has authorised."},
    {id:"institution",label:"Institution",note:"Only if your institution enables it."},
   ]}/>
   <Choice legend="Notifications" value={s.privacy.notifications} onChange={v=>set({notifications:v})} options={[
    {id:"off",label:"None",note:"Nothing is sent."},
    {id:"weekly",label:"Weekly summary",note:"A short digest, once delivery is available."},
   ]}/>
   <Choice legend="External connections" value={s.privacy.external} onChange={v=>set({external:v})} options={[
    {id:"ask",label:"Ask me each time",note:"HSI asks before using any outside service."},
    {id:"never",label:"Never connect",note:"Public sources only, no connection to your accounts."},
   ]}/>
   <section className="ob-always" aria-labelledby="ob-always">
    <h2 id="ob-always" className="ob-h3">Always on, whatever you choose</h2>
    <ul><li>Source verification and provenance for every claim</li><li>Uncertainty is shown, not hidden</li><li>Access is enforced by your administrator's permissions, not by these preferences</li></ul>
   </section>
  </OnboardingShell>
 );
}
