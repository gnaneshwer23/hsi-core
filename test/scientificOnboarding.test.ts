import {describe,expect,it} from "bun:test";
import {
 CONNECTIONS,DOMAINS,EMPTY_STATE,OBJECTIVES,ROLES,STEPS,SYNTHETIC_PUBLICATIONS,
 canAdvance,deriveWorkspacePlan,isStepVisible,looksIdentifying,methodsFocus,nextStep,parseState,previousStep,
 rankedObjectives,reduce,resumeStep,serializeState,validateStep,visibleSteps,type OnboardingState,type PersonaId,
} from "../src/onboarding/scientificOnboarding";

const withRole=(role:Parameters<typeof reduce>[1] extends infer A?any:never)=>reduce(EMPTY_STATE,{type:"setPrimaryRole",role});

describe("scientific onboarding contract",()=>{
 it("holds organisation departments and intended data classes, bounded and validated",()=>{
  let s=reduce(EMPTY_STATE,{type:"addDepartment",name:" Immunology "});
  s=reduce(s,{type:"addDepartment",name:"immunology"});
  expect(s.institutionInfo.departments).toEqual(["Immunology"]);
  for(let i=0;i<30;i++)s=reduce(s,{type:"addDepartment",name:"d"+i});
  expect(s.institutionInfo.departments).toHaveLength(20);
  expect(reduce(s,{type:"removeDepartment",index:0}).institutionInfo.departments[0]).toBe("d0");
  const back=parseState(JSON.stringify({v:1,institutionInfo:{name:"x",departments:["A","A"],intendedData:["public","everything"]}}));
  expect(back.institutionInfo.departments).toEqual(["A"]);expect(back.institutionInfo.intendedData).toEqual(["public"]);
 });
 it("explains every recommendation by the answers that caused it",()=>{
  let s=reduce(EMPTY_STATE,{type:"setPrimaryRole",role:"phd"});s=reduce(s,{type:"setPrimaryDomain",domain:"disease"});
  s=reduce(s,{type:"toggleObjective",id:"review"});s=reduce(s,{type:"toggleObjective",id:"translation"});
  const plan=deriveWorkspacePlan(s)!;
  for(const t of plan.tools)expect(t.because.length).toBeGreaterThan(0);
  const lit=plan.tools.find(t=>t.id==="literature")!;
  expect(lit.because).toEqual(["Conduct literature reviews","Investigate translational opportunities"]);
  expect(plan.tools.find(t=>t.id==="memory")!.because).toEqual(["You chose to keep scientific memory"]);
 });
 it("manages projects and objectives, and keeps them bounded and valid after reload",()=>{
  let s=reduce(EMPTY_STATE,{type:"addProject",name:" Barrier study ",note:"n"});
  s=reduce(s,{type:"addProject",name:"barrier STUDY",note:""});
  expect(s.projects).toEqual([{name:"Barrier study",note:"n"}]);
  for(let i=0;i<20;i++)s=reduce(s,{type:"addProject",name:"p"+i,note:""});
  expect(s.projects).toHaveLength(10);
  expect(parseState(serializeState(s)).projects).toHaveLength(10);
  expect(reduce(s,{type:"removeProject",index:0}).projects[0]!.name).toBe("p0");
  expect(reduce(EMPTY_STATE,{type:"setObjectives",ids:["learn","learn","nope" as any]}).objectives).toEqual(["learn"]);
  expect(parseState(JSON.stringify({v:1,projects:[{name:"ok"},{name:""},{name:5}]})).projects).toEqual([{name:"ok",note:""}]);
 });
 it("gives a postdoc a conflict comparison and a PhD researcher a gap investigation as the first action",()=>{
  const f=(r:any)=>deriveWorkspacePlan({...EMPTY_STATE,primaryRole:r,primaryDomain:"immunology",objectives:["gaps"]})!.firstInvestigation.title;
  expect(f("postdoc")).toBe("Compare conflicting scientific findings");
  expect(f("phd")).toBe("Investigate a research gap");
 });
 it("offers the thirteen roles and maps every role to one of eight dashboards",()=>{
  expect(ROLES).toHaveLength(13);
  const personas=new Set(ROLES.map(r=>r.persona));
  expect([...personas].sort()).toEqual(["biotech","clinical","computational","institution","laboratory","professor","researcher","student"]);
 });
 it("lists six equal domains and twelve objectives",()=>{
  expect(DOMAINS.map(d=>d.key).sort()).toEqual(["disease","genomics","immunology","microbiome","neuroscience","organ"]);
  expect(OBJECTIVES).toHaveLength(12);
 });
 it("requires a primary role, a primary domain and at least one objective; everything else is optional",()=>{
  expect(canAdvance("role",EMPTY_STATE)).toBe(false);
  expect(canAdvance("science",EMPTY_STATE)).toBe(false);
  expect(canAdvance("objectives",EMPTY_STATE)).toBe(false);
  for(const optional of ["welcome","identity","methods","resources","preferences"] as const)expect(canAdvance(optional,EMPTY_STATE)).toBe(true);
  expect(STEPS.filter(s=>!s.optional).map(s=>s.id)).toEqual(["role","science","objectives","review"]);
 });
 it("keeps the primary role out of the secondary list and role selection never touches access",()=>{
  let s=reduce(EMPTY_STATE,{type:"toggleSecondaryRole",role:"phd"});
  s=reduce(s,{type:"setPrimaryRole",role:"phd"});
  expect(s.secondaryRoles).not.toContain("phd");
  expect(reduce(s,{type:"toggleSecondaryRole",role:"phd"})).toBe(s);
  expect(Object.keys(s).some(k=>/access|grant|permission/i.test(k))).toBe(false);
 });
 it("branches: the institution step shows for administrators and the institutional path; resources hide for administrators",()=>{
  const researcher=withRole("phd");
  expect(isStepVisible("institution",researcher)).toBe(false);
  expect(isStepVisible("resources",researcher)).toBe(true);
  const admin=withRole("admin");
  expect(admin.path).toBe("institution");
  expect(isStepVisible("institution",admin)).toBe(true);
  expect(isStepVisible("resources",admin)).toBe(false);
  expect(isStepVisible("institution",{...researcher,path:"institution"})).toBe(true);
  expect(nextStep("role",admin)).toBe("institution");
  expect(nextStep("role",researcher)).toBe("identity");
  expect(previousStep("identity",admin)).toBe("institution");
  expect(nextStep("review",researcher)).toBeNull();
  expect(previousStep("welcome",researcher)).toBeNull();
  expect(visibleSteps(admin).map(s=>s.id)).not.toContain("resources");
 });
 it("validates ORCID by check digit and flags nothing it cannot verify",()=>{
  const ok=reduce(EMPTY_STATE,{type:"setIdentity",patch:{orcid:"0000-0002-1825-0097"}});
  expect(validateStep("identity",ok)).toEqual({});
  const bad=reduce(EMPTY_STATE,{type:"setIdentity",patch:{orcid:"0000-0002-1825-0098"}});
  expect(validateStep("identity",bad).orcid).toBeDefined();
  const plan=deriveWorkspacePlan({...ok,primaryRole:"phd"});
  expect(plan!.notes.join(" ")).toContain("not been verified");
 });
 it("validates the institution step",()=>{
  expect(validateStep("institution",EMPTY_STATE).institutionName).toBeDefined();
  const s=reduce(EMPTY_STATE,{type:"setInstitution",patch:{name:"Example University",contact:"not-an-email"}});
  expect(validateStep("institution",s).contact).toBeDefined();
  expect(validateStep("institution",reduce(s,{type:"setInstitution",patch:{contact:""}}))).toEqual({});
 });
 it("adds interests once, trims, and caps them",()=>{
  let s=reduce(EMPTY_STATE,{type:"addInterest",kind:"Gene",name:"  IL10 "});
  s=reduce(s,{type:"addInterest",kind:"Gene",name:"il10"});
  expect(s.interests).toEqual([{kind:"Gene",name:"IL10"}]);
  for(let i=0;i<30;i++)s=reduce(s,{type:"addInterest",kind:"Pathway",name:"p"+i});
  expect(s.interests).toHaveLength(20);
  expect(reduce(s,{type:"addInterest",kind:"Gene",name:"   "})).toBe(s);
 });
 it("ranks objectives by persona and keeps all twelve available",()=>{
  for(const p of ["student","professor","institution"] as PersonaId[]){
   const r=rankedObjectives(p);expect(r.suggested.length+r.others.length).toBe(12);
  }
  expect(rankedObjectives("student").suggested.map(o=>o.id)).toContain("learn");
  expect(rankedObjectives("institution").suggested.map(o=>o.id)).toContain("coordinate");
  expect(rankedObjectives(null).suggested).toHaveLength(0);
 });
 it("adapts the method questions to the persona without removing any group",()=>{
  for(const p of ["student","computational","clinical","laboratory","professor",null] as (PersonaId|null)[])expect([...methodsFocus(p)].sort()).toEqual(["computational","evidence","level","techniques"]);
  expect(methodsFocus("student")[0]).toBe("level");
  expect(methodsFocus("computational")[0]).toBe("computational");
 });
 it("defaults to private memory, private sharing and no external sharing without asking",()=>{
  expect(EMPTY_STATE.privacy).toEqual({memory:"private",sharing:"private",notifications:"off",external:"ask"});
 });
 it("separates public, private and restricted connections and marks none as connected",()=>{
  expect(new Set(CONNECTIONS.map(c=>c.dataClass))).toEqual(new Set(["public","private","restricted"]));
  expect(CONNECTIONS.every(c=>c.status==="Planned"||c.status==="Prototype")).toBe(true);
  expect(CONNECTIONS.find(c=>c.id==="institutional-data")!.dataClass).toBe("restricted");
 });
 it("round-trips state and fails closed on bad or tampered storage",()=>{
  let s=withRole("postdoc");
  s=reduce(s,{type:"setPrimaryDomain",domain:"immunology"});s=reduce(s,{type:"toggleSecondaryDomain",domain:"neuroscience"});
  s=reduce(s,{type:"toggleObjective",id:"conflicts"});s=reduce(s,{type:"visit",step:"role"});
  expect(parseState(serializeState(s))).toEqual(s);
  expect(parseState(null)).toEqual(EMPTY_STATE);
  expect(parseState("{not json")).toEqual(EMPTY_STATE);
  expect(parseState(JSON.stringify({v:2}))).toEqual(EMPTY_STATE);
  const evil=parseState(JSON.stringify({v:1,primaryRole:"root",primaryDomain:"x",objectives:["learn","<script>"],secondaryDomains:["immunology","immunology","nope"],connections:{orcid:"connected",pubmed:"interested"},privacy:{sharing:"world"}}));
  expect(evil.primaryRole).toBeNull();expect(evil.primaryDomain).toBeNull();
  expect(evil.objectives).toEqual(["learn"]);expect(evil.secondaryDomains).toEqual(["immunology"]);
  expect(evil.connections).toEqual({pubmed:"interested"});expect(evil.privacy.sharing).toBe("private");
 });
 it("resumes at the first step not yet visited or skipped, and at review once all are done",()=>{
  let s=withRole("phd");
  expect(resumeStep(EMPTY_STATE)).toBe("role");
  s=reduce(s,{type:"visit",step:"role"});expect(resumeStep(s)).toBe("identity");
  s=reduce(s,{type:"skip",step:"identity"});expect(resumeStep(s)).toBe("science");
  for(const st of ["science","objectives","methods","resources","preferences"] as const)s=reduce(s,{type:"visit",step:st});
  s=reduce(s,{type:"setPrimaryDomain",domain:"genomics"});s=reduce(s,{type:"toggleObjective",id:"gaps"});
  expect(resumeStep(s)).toBe("review");
 });
 it("plans from the answers only: no findings, honest statuses, role does not grant access",()=>{
  expect(deriveWorkspacePlan(EMPTY_STATE)).toBeNull();
  let s=withRole("pi");s=reduce(s,{type:"setPrimaryDomain",domain:"organ"});s=reduce(s,{type:"toggleObjective",id:"coordinate"});
  const plan=deriveWorkspacePlan(s)!;
  expect(plan.persona).toBe("professor");
  expect(plan.firstInvestigation.basis).toBe("your objectives");
  expect(plan.tools.length).toBeGreaterThan(0);
  expect(plan.tools.every(t=>["Prototype","In development","Planned","Illustrative"].includes(t.status))).toBe(true);
  expect(plan.firstAction.to).toBe("/workspace/preview/professor");
  expect(plan.notes.join(" ")).toMatch(/does not grant access/);
  const withQuestion=deriveWorkspacePlan(reduce(s,{type:"set",patch:{question:"Does butyrate change barrier function?"}}))!;
  expect(withQuestion.firstInvestigation.basis).toBe("your question");
  expect(withQuestion.firstInvestigation.title).toBe("Does butyrate change barrier function?");
  const noMemory=deriveWorkspacePlan(reduce(s,{type:"setPrivacy",patch:{memory:"off"}}))!;
  expect(noMemory.tools.some(t=>t.id==="memory")).toBe(s.objectives.includes("coordinate"));
 });
 it("sends people to the graph workspace for the tools that now work there",()=>{
  let s=withRole("postdoc");s=reduce(s,{type:"toggleObjective",id:"conflicts"});s=reduce(s,{type:"toggleObjective",id:"hypotheses"});
  const plan=deriveWorkspacePlan(s)!;
  expect(plan.graphAction).toEqual({label:"Open the Living Intelligence Graph",to:"/workspace/graph"});
  for(const id of ["contradiction","hypothesis"])expect(plan.tools.find(t=>t.id===id)).toMatchObject({to:"/workspace/graph",status:"Prototype"});
  expect(plan.tools.find(t=>t.id==="design")?.status??"Planned").toBe("Planned");
 });
 it("every role yields a plan with a distinct first action by persona",()=>{
  const firsts=new Map<PersonaId,string>();
  for(const r of ROLES){
   const p=deriveWorkspacePlan({...EMPTY_STATE,primaryRole:r.id,primaryDomain:"disease",objectives:["mechanisms"]})!;
   expect(p.persona).toBe(r.persona);firsts.set(p.persona,p.firstInvestigation.title);
  }
  expect(new Set(firsts.values()).size).toBe(8);
 });
 it("flags text that looks like an identifier and labels demo publications as samples",()=>{
  expect(looksIdentifying("NHS number 943 476 5919")).toBe(true);
  expect(looksIdentifying("patient@example.org")).toBe(true);
  expect(looksIdentifying("Does butyrate affect Treg differentiation?")).toBe(false);
  expect(SYNTHETIC_PUBLICATIONS.every(p=>/^Sample record/.test(p.title))).toBe(true);
 });
});
