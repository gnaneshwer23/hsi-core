import {useEffect} from "react";
import {useLocation} from "react-router-dom";
import {Link} from "../router";
import {applySeo} from "../../lib/seo/applySeo";
import {
 PERSONA_LABEL,deriveWorkspacePlan,objectiveById,roleById,type PersonaId,
} from "../../../../src/onboarding/scientificOnboarding";
import {
 PREVIEW_PERSONAS,isPersona,orderPanels,previewPath,profileFor,researcherVariant,
} from "../../../../src/onboarding/workspacePreview";
import {useOnboarding} from "../onboarding/store";
import {FirstAction,Panel,WorkspaceFrame} from "./Frame";
import {biotech as biotechB,clinical,computational,institution} from "./dashB";
import {laboratory,professor,researcher,student,type Built} from "./dashA";

const BUILD:Record<PersonaId,(c:{state:ReturnType<typeof useOnboarding>[0];personalised:boolean})=>Built>={
 student,researcher,professor,laboratory,computational,clinical,biotech:biotechB,institution,
};
const BLURB:Record<PersonaId,string>={
 student:"Learning pathway, concepts and evidence literacy.",
 researcher:"Thesis and gaps for a PhD; mechanisms, conflicts and experiments for a postdoc.",
 professor:"Group overview, project overlap and opportunities, with access kept explicit.",
 laboratory:"Methods, experiment plans and observation context.",
 computational:"Datasets with provenance, a graph neighbourhood and multi-omics planning.",
 clinical:"Disease mechanism traces, trial intelligence and the translational ladder.",
 biotech:"Target evidence, readiness and a scientific portfolio.",
 institution:"Organisation structure, membership, permissions and governance.",
};

function Chooser(){
 const [s]=useOnboarding();
 const mine=s.primaryRole?roleById[s.primaryRole].persona:null;
 return (
  <WorkspaceFrame persona={null} profile={null} panels={[]}>
   <p className="ws-eyebrow">Workspace previews</p>
   <h1 className="ws-title">Eight workspaces, one for each way of working.</h1>
   <p className="ws-lede">Each preview is organised differently, because a student, a laboratory scientist and an administrator ask different things of HSI. All content is sample content.</p>
   <ul className="ws-choose">
    {PREVIEW_PERSONAS.map(p=>(
     <li key={p} data-mine={p===mine}>
      <h2><Link to={previewPath(p)}>{PERSONA_LABEL[p]}</Link>{p===mine&&<span className="ws-pill"> your setup</span>}</h2>
      <p>{BLURB[p]}</p>
     </li>
    ))}
   </ul>
   {!mine&&<p className="ws-note">Want your own view? <Link to="/onboarding" className="ws-link">Set up HSI</Link> and your role, domains and goals shape which panels lead.</p>}
  </WorkspaceFrame>
 );
}

function Preview({persona}:{persona:PersonaId}){
 const [s]=useOnboarding();
 const plan=deriveWorkspacePlan(s);
 const profile=profileFor(persona,s,{domains:plan?.domains??[],objectives:plan?.objectives??[]});
 const objectives=profile.personalised?s.objectives:[];
 const role=profile.personalised?s.primaryRole:null;
 const panels=orderPanels(persona,role,objectives);
 const built=BUILD[persona]({state:s,personalised:profile.personalised});
 const variant=persona==="researcher"?({phd:"PhD",postdoc:"Postdoctoral",general:""}[researcherVariant(role)]):"";
 const labelOf=(o:string)=>o;
 return (
  <WorkspaceFrame persona={persona} profile={profile} panels={panels} variant={variant}>
   <p className="ws-eyebrow">{PERSONA_LABEL[persona]}{variant?` · ${variant}`:""}</p>
   <h1 className="ws-title">{profile.personalised?`Your ${profile.roleLabel.toLowerCase()} workspace`:`${PERSONA_LABEL[persona]} workspace`}</h1>
   {profile.personalised&&(
    <ul className="ws-profile" aria-label="Built from your answers">
     {profile.domains.slice(0,3).map(d=><li key={d}>{d}</li>)}
     {profile.objectives.slice(0,3).map(o=><li key={o}>{labelOf(o)}</li>)}
    </ul>
   )}
   <FirstAction label={built.first.label} question={profile.question} output={built.first.output}/>
   {panels.map(p=>(
    <Panel key={p.key} id={p.key} title={p.title} matched={profile.personalised?p.matched.map(m=>objectiveById[m].label):[]}>{built.panels[p.key]}</Panel>
   ))}
  </WorkspaceFrame>
 );
}

/** /workspace/preview and /workspace/preview/:persona. Sample content only; nothing is created or granted. */
export default function WorkspacePreview(){
 const {pathname}=useLocation();
 const last=pathname.split("/").filter(Boolean).pop()??"";
 const persona=isPersona(last)?last:null;
 useEffect(()=>{applySeo(pathname)},[pathname]);
 return persona?<Preview persona={persona}/>:<Chooser/>;
}
