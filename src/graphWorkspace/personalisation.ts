/**
 * LEA-04I: personalisation of the graph workspace from the scientific onboarding answers.
 * It chooses only where the workspace opens: the mode and the scope, and how much plain-language help is shown.
 * It never sets a filter, never hides a relationship, never changes a status, and never makes a mode unreachable.
 * Every choice carries its reason, so the person can see why the workspace opened where it did and undo it.
 */
import type {HsiDomain} from "./domainMap";
import type {ModeId} from "./modes";

export type WorkspaceScope={id:string;label:string;pair:readonly [HsiDomain,HsiDomain]|null};
export const WORKSPACE_SCOPES:readonly WorkspaceScope[]=[
 {id:"imm-mic",label:"Immunology × Microbiome",pair:["immunology","microbiome"]},
 {id:"imm-neu",label:"Immunology × Neuroscience",pair:["immunology","neuroscience"]},
 {id:"mic-neu",label:"Microbiome × Neuroscience",pair:["microbiome","neuroscience"]},
 {id:"all",label:"Whole published graph",pair:null},
];
export const DEFAULT_OPENING={mode:"mechanism" as ModeId,scopeId:"imm-mic"};

/** The onboarding answers this needs, kept narrow so nothing else from the profile is read. */
export type PersonalisationInput={
 persona:"student"|"researcher"|"professor"|"laboratory"|"computational"|"clinical"|"biotech"|"institution"|null;
 objectives:readonly string[];
 primaryDomain:HsiDomain|null;secondaryDomains:readonly HsiDomain[];
 level:"foundations"|"working"|"expert"|null;
};

export type OpeningView={
 mode:ModeId;scopeId:string;
 /** Plain-language orientation for people who asked for foundations. */
 guidance:boolean;
 reasons:string[];
 personalised:boolean;
};

/** Goal to mode, in precedence order: the first goal in this list that the person chose decides. */
const GOAL_MODE:readonly [string,ModeId,string][]=[
 ["conflicts","contradiction","you chose to investigate conflicting evidence"],
 ["hypotheses","hypothesis","you chose to generate testable hypotheses"],
 ["plan","experimental","you chose to plan experiments"],
 ["methods","experimental","you chose to improve experimental methods"],
 ["gaps","gap","you chose to identify research gaps"],
 ["review","evidence","you chose to conduct literature reviews"],
 ["learn","atlas","you chose to learn scientific concepts"],
 ["mechanisms","mechanism","you chose to understand biological mechanisms"],
 ["targets","mechanism","you chose to explore drug targets"],
 ["translation","mechanism","you chose to investigate translational opportunities"],
];
const PERSONA_MODE:Partial<Record<NonNullable<PersonalisationInput["persona"]>,[ModeId,string]>>={
 student:["atlas","your role is a student"],
 laboratory:["experimental","your role runs a laboratory"],
 computational:["gap","your role is computational"],
};

export function openingView(p:PersonalisationInput):OpeningView{
 const reasons:string[]=[];
 let mode=DEFAULT_OPENING.mode,scopeId=DEFAULT_OPENING.scopeId,personalised=false;

 const goal=GOAL_MODE.find(([g])=>p.objectives.includes(g));
 if(goal){mode=goal[1];reasons.push(`Opened in this mode because ${goal[2]}.`);personalised=true}
 else if(p.persona&&PERSONA_MODE[p.persona]){const [m,why]=PERSONA_MODE[p.persona]!;mode=m;reasons.push(`Opened in this mode because ${why}.`);personalised=true}

 if(p.primaryDomain){
  const withPrimary=WORKSPACE_SCOPES.filter(s=>s.pair?.includes(p.primaryDomain!));
  const both=withPrimary.find(s=>p.secondaryDomains.some(d=>d!==p.primaryDomain&&s.pair!.includes(d)));
  const chosen=both??withPrimary[0];
  if(chosen){
   scopeId=chosen.id;personalised=true;
   reasons.push(both?`Scoped to ${chosen.label} because these are your primary and secondary domains.`:`Scoped to ${chosen.label} because it includes your primary domain.`);
  }else{
   scopeId="all";personalised=true;
   reasons.push("Opened on the whole published graph because there is no two-domain view for your primary domain yet.");
  }
 }

 const guidance=p.level==="foundations";
 if(guidance){reasons.push("Plain-language guidance is shown because you asked for foundations.");personalised=true}
 if(personalised)reasons.push("This only chooses where the workspace opens. No relationship is hidden, and every mode, including conflicts, stays one click away.");
 return {mode,scopeId,guidance,reasons,personalised};
}
