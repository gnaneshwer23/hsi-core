/**
 * LEA-02C: integration contracts between the onboarding interface and the main HSI backend.
 *
 * The interface owns no identity, persistence, membership, permission or memory system. This file
 * states what it would send and what it needs back, reuses the existing researcher-profile contract
 * where one exists, and refuses to fake any backend result. Nothing here grants access.
 */
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {normalizeProfile,parseOrcid,type Profile} from "./researcherProfile";
import {
 DOMAINS,looksIdentifying,personaOf,type OnboardingState,type PersonaId,type RoleId,type ObjectiveId,
} from "./scientificOnboarding";

export const PROFILE_EXTENSION_SCHEMA="hsi-scientific-profile-extension-1" as const;

/* ------------------------------------------------------ existing profile */

const OLD_ROLE:Record<PersonaId,string>={
 student:"Student",researcher:"Research scientist",professor:"Academic",laboratory:"Research scientist",
 computational:"Research scientist",clinical:"Clinical researcher",biotech:"Biotech or pharma scientist",institution:"Other",
};
const OLD_STAGE:Partial<Record<RoleId,string>>={
 undergraduate:"Student",masters:"Student",phd:"Early-career researcher",postdoc:"Early-career researcher",independent:"Established researcher",
 pi:"Principal investigator",lab:"Established researcher",compbio:"Established researcher",bioinf:"Established researcher",
 clinical:"Clinician researcher",biotech:"Industry scientist",pharma:"Industry scientist",admin:"Other",
};
/** Only objectives with an exact counterpart in the existing goal list are carried over. The rest are reported, never remapped loosely. */
const OLD_GOAL:Partial<Record<ObjectiveId,string>>={
 mechanisms:"Understand biological mechanisms",targets:"Identify therapeutic targets",conflicts:"Compare scientific evidence",hypotheses:"Generate hypotheses",
};

export type PreparedSubmission=
 |{ok:true;profile:Profile;extension:ProfileExtensionV1;droppedObjectives:ObjectiveId[]}
 |{ok:false;reasons:string[]};

/** Fields the existing server contract does not hold. A proposal: the backend has not accepted this schema. */
export type ProfileExtensionV1={
 schema:typeof PROFILE_EXTENSION_SCHEMA;
 primaryRole:RoleId;secondaryRoles:RoleId[];
 domains:{primary:string;secondary:string[]};
 objectives:ObjectiveId[];
 methods:OnboardingState["methods"];
 connectionInterest:string[];
 /** Preferences only. Enforcement is the backend's: these never widen access. */
 preferences:OnboardingState["privacy"];
 organisation:{name:string;sizeBand:string;departments:string[];intendedData:string[]}|null;
};

/**
 * What the interface would send to the profile store, built from the answers only.
 * Free text is checked with the repository's PHI boundary first; a failure blocks the whole submission.
 * Sample publications are never included, and no field names an access grant.
 */
export function prepareSubmission(s:OnboardingState):PreparedSubmission{
 if(!s.primaryRole||!s.primaryDomain)return {ok:false,reasons:["missing_required_answers"]};
 const persona=personaOf(s)!;
 const blobs=[s.question,s.methods.expertise,s.identity.name,s.identity.institution,s.identity.department,s.institutionInfo.name,...s.interests.map(i=>i.name),...s.institutionInfo.departments,...s.projects.map(p=>p.name+" "+p.note)].filter(Boolean);
 const phi=rejectPhiPayload({textBlobs:blobs});
 const reasons=[...(phi.ok?[]:phi.reasons.map(String)),...(blobs.some(looksIdentifying)?["identifier_like_text"]:[])];
 if(reasons.length)return {ok:false,reasons:[...new Set(reasons)]};
 const orcid=parseOrcid(s.identity.orcid);
 const goals=s.objectives.map(o=>OLD_GOAL[o]).filter((g):g is string=>!!g);
 const profile=normalizeProfile({
  v:1,role:OLD_ROLE[persona],stage:OLD_STAGE[s.primaryRole]??null,background:s.methods.expertise,question:s.question.trim(),
  orcid,papers:[],cadence:s.privacy.notifications==="weekly"?"weekly":"off",goals,
  interests:[...s.interests.map(i=>i.name),...[s.primaryDomain,...s.secondaryDomains].map(d=>DOMAINS.find(x=>x.key===d)!.label)],
  followed:[],dismissed:[],onboarded:s.done,
 });
 const extension:ProfileExtensionV1={
  schema:PROFILE_EXTENSION_SCHEMA,primaryRole:s.primaryRole,secondaryRoles:s.secondaryRoles,
  domains:{primary:s.primaryDomain,secondary:s.secondaryDomains},objectives:s.objectives,methods:s.methods,
  connectionInterest:Object.keys(s.connections),preferences:s.privacy,
  organisation:s.institutionInfo.name.trim()?{name:s.institutionInfo.name.trim(),sizeBand:s.institutionInfo.size,departments:s.institutionInfo.departments,intendedData:s.institutionInfo.intendedData}:null,
 };
 return {ok:true,profile,extension,droppedObjectives:s.objectives.filter(o=>!OLD_GOAL[o])};
}

/** Guard used by tests and by any future sender: an outgoing payload may never carry an access-granting key. */
const ACCESS_KEY=/^(access|grant|grants|permission|permissions|entitlement|entitlements|scope|scopes|isAdmin|admin|membership|memberships|token|password|secret)$/i;
export function findAccessFields(value:unknown,path=""):string[]{
 if(!value||typeof value!=="object")return [];
 const out:string[]=[];
 for(const [k,v] of Object.entries(value as Record<string,unknown>)){
  if(ACCESS_KEY.test(k))out.push(path+k);
  out.push(...findAccessFields(v,`${path}${k}.`));
 }
 return out;
}

/* -------------------------------------------------------------- contracts */

export type ContractId="profile-store"|"identity-verification"|"institution-membership"|"access-decision"|"scientific-memory"|"sharing-policy"|"connection-grants";
export type Contract={
 id:ContractId;title:string;purpose:string;
 /** A proposal for the main backend to accept or change; none of these routes exist as stated. */
 proposedRoute:string;
 status:"Exists, fail-closed"|"Planned";
 owner:"Main HSI backend";
 requires:string[];
 interfaceSends:string[];
 interfaceNeedsBack:string[];
 failClosed:string;
 today:string;
};

export const CONTRACTS:readonly Contract[]=[
 {id:"profile-store",title:"Profile store",purpose:"Persist the scientific profile for a verified account.",
  proposedRoute:"GET and PUT /api/research/onboarding-profile (exists); extension fields need a backend decision",
  status:"Exists, fail-closed",owner:"Main HSI backend",requires:["Verified principal","Additive profile SQL applied under staging pins"],
  interfaceSends:["Existing researcher profile (hsi-researcher-profile-1)","Profile extension (proposed)"],interfaceNeedsBack:["Stored profile","Version for conflict detection"],
  failClosed:"Writes are refused as SCHEMA_NOT_APPLIED until an owner applies the store. The interface stays on device storage.",
  today:"Device-local storage only."},
 {id:"identity-verification",title:"Identity verification",purpose:"Prove an ORCID iD belongs to the signed-in person.",
  proposedRoute:"POST /api/research/identity/orcid/start and /callback (OAuth, server side)",status:"Planned",owner:"Main HSI backend",
  requires:["Identity binding (ADR-013)","ORCID OAuth client registered by the owner"],interfaceSends:["A request to begin verification, no iD typed by the client is trusted"],
  interfaceNeedsBack:["Verified iD with verification time and source"],failClosed:"An unverified iD is always displayed as unverified.",today:"iD is format-checked and labelled not verified."},
 {id:"institution-membership",title:"Institution membership",purpose:"Confirm that a person belongs to an organisation and in which role.",
  proposedRoute:"Administrator-driven invitations and confirmations on the main backend",status:"Planned",owner:"Main HSI backend",
  requires:["Verified organisation","Administrator action","Scope registry (ADR-014)"],interfaceSends:["Organisation name and approximate size as a request"],
  interfaceNeedsBack:["Organisation record and membership state set by an administrator"],failClosed:"A self-selected role never confers membership.",today:"Nothing is sent. Roles personalise only."},
 {id:"access-decision",title:"Access decision",purpose:"Say what a verified person may open.",
  proposedRoute:"Evaluated server side on every request; the interface only displays the result",status:"Planned",owner:"Main HSI backend",
  requires:["Scope registry (ADR-014)","Membership and grants"],interfaceSends:["Nothing: the interface never asserts access"],interfaceNeedsBack:["Allow or deny with a reason"],
  failClosed:"Unknown or unreachable means deny.",today:"Every permission is shown as Not provisioned."},
 {id:"scientific-memory",title:"Scientific memory",purpose:"Keep a person's questions, sources and decisions.",
  proposedRoute:"Backed by the existing investigation store (ADR-012), not a new store",status:"Planned",owner:"Main HSI backend",
  requires:["Investigation store","Owner-scoped rows"],interfaceSends:["The memory preference (off, private, project)"],interfaceNeedsBack:["Memory state and what is retained"],
  failClosed:"Off or unknown means nothing is retained.",today:"No memory is kept."},
 {id:"sharing-policy",title:"Sharing policy",purpose:"Record who a person's work may be shared with.",
  proposedRoute:"Part of scope and membership; sharing needs an authorised group",status:"Planned",owner:"Main HSI backend",
  requires:["Authorised group","Membership"],interfaceSends:["The sharing preference"],interfaceNeedsBack:["Effective policy"],
  failClosed:"The effective policy is the narrower of preference and grant; default is private.",today:"Private; group and institution record a preference only."},
 {id:"connection-grants",title:"External connections",purpose:"Let a person authorise a source such as a reference manager.",
  proposedRoute:"OAuth per provider, tokens held server side, revocable",status:"Planned",owner:"Main HSI backend",
  requires:["Provider registrations","Token vault"],interfaceSends:["Interest only"],interfaceNeedsBack:["Connection state and revocation"],
  failClosed:"No connection exists until the person completes a provider flow; tokens never reach the browser.",today:"Interest is recorded on device."},
];
export const contractById=Object.fromEntries(CONTRACTS.map(c=>[c.id,c])) as Record<ContractId,Contract>;

/* ----------------------------------------------------------- client stub */

export type ContractResult<T>=|{ok:true;data:T}|{ok:false;code:"NOT_CONFIGURED"|"NOT_AUTHENTICATED"|"REFUSED";detail:string};

/**
 * The only client that exists today. Every call reports that the backend is not configured: it cannot
 * be mistaken for success, and nothing is stored or verified.
 */
export function createUnconfiguredClient(){
 const no=<T,>(id:ContractId):ContractResult<T>=>({ok:false,code:"NOT_CONFIGURED",detail:`${contractById[id].title} is not connected. ${contractById[id].failClosed}`});
 return {
  saveProfile:(_s:OnboardingState)=>Promise.resolve(no<never>("profile-store")),
  startOrcidVerification:()=>Promise.resolve(no<never>("identity-verification")),
  requestMembership:(_org:string)=>Promise.resolve(no<never>("institution-membership")),
  getAccessDecision:(_resource:string)=>Promise.resolve(no<never>("access-decision")),
  setMemory:(_m:string)=>Promise.resolve(no<never>("scientific-memory")),
  setSharing:(_s:string)=>Promise.resolve(no<never>("sharing-policy")),
  startConnection:(_id:string)=>Promise.resolve(no<never>("connection-grants")),
 };
}
