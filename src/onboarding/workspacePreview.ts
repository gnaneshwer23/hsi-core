/**
 * LEA-02B: role-specific workspace preview contract (pure, shared with tests).
 * Each persona has its own set of panels. The answers choose which panel leads;
 * nothing here creates a workspace, grants access or reports a finding.
 */
import {PERSONA_LABEL,roleById,type ObjectiveId,type OnboardingState,type PersonaId,type RoleId} from "./scientificOnboarding";

export type PanelKey=
 |"pathway"|"concepts"|"literacy"|"explain"
 |"thesis"|"gaps"|"memory"|"hypotheses"|"mechanism"|"conflicts"|"experiments"
 |"group"|"overlap"|"opportunities"|"access"
 |"methods"|"plan"|"observations"
 |"datasets"|"graph"|"omics"|"fit"
 |"trace"|"trials"|"ladder"|"boundaries"
 |"target"|"readiness"|"portfolio"|"tconflicts"
 |"structure"|"members"|"permissions"|"governance";

export type PanelDef={key:PanelKey;title:string;objectives:readonly ObjectiveId[]};

const P=(key:PanelKey,title:string,objectives:readonly ObjectiveId[]=[]):PanelDef=>({key,title,objectives});

/** Distinct information architecture per persona: different panels, not one template with different words. */
export const PANELS:Record<PersonaId,readonly PanelDef[]>={
 student:[P("pathway","Learning pathway",["learn"]),P("concepts","Biological concepts",["learn","mechanisms"]),P("literacy","Reading the evidence",["review","learn"]),P("explain","Explain it at my level",["learn","mechanisms"])],
 researcher:[
  P("thesis","Thesis map",["review","gaps"]),P("gaps","Literature gaps",["gaps","review"]),P("memory","Scientific memory",["coordinate","review"]),P("hypotheses","Hypotheses",["hypotheses"]),
  P("mechanism","Mechanism under investigation",["mechanisms"]),P("conflicts","Conflicting evidence",["conflicts"]),P("experiments","Experimental planning",["plan","methods"]),
 ],
 professor:[P("group","Research group",["coordinate"]),P("overlap","Project overlap",["collaborators","coordinate"]),P("opportunities","Scientific opportunities",["gaps","collaborators"]),P("access","Access and sharing",["coordinate"])],
 laboratory:[P("methods","Methods library",["methods"]),P("plan","Experiment plan",["plan","hypotheses"]),P("observations","Observation context",["methods","plan"])],
 computational:[P("datasets","Datasets and provenance",["targets","gaps"]),P("graph","Knowledge-graph neighbourhood",["mechanisms","targets"]),P("omics","Multi-omics layers",["hypotheses","gaps"]),P("fit","Method fit",["methods","plan"])],
 clinical:[P("trace","Disease mechanism trace",["mechanisms","translation"]),P("trials","Trial intelligence",["translation"]),P("ladder","Translational evidence ladder",["conflicts","translation"]),P("boundaries","Clinical boundaries",[])],
 biotech:[P("target","Target evidence",["targets"]),P("readiness","Translational readiness",["translation","targets"]),P("portfolio","Scientific portfolio",["coordinate","translation"]),P("tconflicts","Conflicts to resolve",["conflicts"])],
 institution:[P("structure","Organisation structure",["coordinate"]),P("members","Membership",["coordinate"]),P("permissions","Permissions",["coordinate"]),P("governance","Research governance",["coordinate"])],
};

/** PhD and postdoctoral researchers share a persona but see different panels. */
export type ResearcherVariant="phd"|"postdoc"|"general";
export function researcherVariant(role:RoleId|null):ResearcherVariant{return role==="phd"?"phd":role==="postdoc"?"postdoc":"general"}
const RESEARCHER_PANELS:Record<ResearcherVariant,readonly PanelKey[]>={
 phd:["thesis","gaps","memory","hypotheses","conflicts"],
 postdoc:["mechanism","conflicts","experiments","gaps","memory"],
 general:["gaps","memory","hypotheses","conflicts","experiments"],
};
export function panelsFor(persona:PersonaId,role:RoleId|null):readonly PanelDef[]{
 if(persona!=="researcher")return PANELS[persona];
 const keep=RESEARCHER_PANELS[researcherVariant(role)];
 return keep.map(k=>PANELS.researcher.find(p=>p.key===k)!);
}

export type OrderedPanel=PanelDef&{emphasised:boolean;matched:readonly ObjectiveId[]};
/** Stable: panels matching more of the chosen objectives lead; ties keep the catalogue order. */
export function orderPanels(persona:PersonaId,role:RoleId|null,objectives:readonly ObjectiveId[]):OrderedPanel[]{
 const chosen=new Set(objectives);
 return panelsFor(persona,role)
  .map((p,i)=>{const matched=p.objectives.filter(o=>chosen.has(o));return {...p,matched,emphasised:matched.length>0,i}})
  .sort((a,b)=>b.matched.length-a.matched.length||a.i-b.i)
  .map(({i:_i,...p})=>p);
}

export const PREVIEW_PERSONAS=Object.keys(PERSONA_LABEL) as PersonaId[];
export const previewPath=(p?:PersonaId)=>p?`/workspace/preview/${p}`:"/workspace/preview";
export const isPersona=(v:string):v is PersonaId=>(PREVIEW_PERSONAS as string[]).includes(v);

export type ProfileView={
 personalised:boolean;roleLabel:string;domains:string[];objectives:string[];question:string;note:string;
};
/** What the preview may say about the visitor. Only their own answers, and only when their role matches this preview. */
export function profileFor(persona:PersonaId,s:OnboardingState,labels:{domains:string[];objectives:string[]}):ProfileView{
 const mine=s.primaryRole&&roleById[s.primaryRole].persona===persona;
 if(!mine)return {personalised:false,roleLabel:PERSONA_LABEL[persona],domains:[],objectives:[],question:"",
  note:s.primaryRole?`Your setup chose a different role, so this is the sample ${PERSONA_LABEL[persona].toLowerCase()} view.`:"Showing a sample profile. Set up HSI to personalise it."};
 return {personalised:true,roleLabel:roleById[s.primaryRole!].label,domains:labels.domains,objectives:labels.objectives,question:s.question.trim(),note:"Built from your answers, stored on this device."};
}
