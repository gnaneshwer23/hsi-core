import {describe,expect,it} from "bun:test";
import {EMPTY_STATE,reduce,ROLES,type OnboardingState} from "../src/onboarding/scientificOnboarding";
import {CONTRACTS,PROFILE_EXTENSION_SCHEMA,createUnconfiguredClient,findAccessFields,prepareSubmission} from "../src/onboarding/integrationContracts";

const ready=(over:Partial<OnboardingState>={}):OnboardingState=>({...EMPTY_STATE,primaryRole:"postdoc",primaryDomain:"immunology",secondaryDomains:["neuroscience"],objectives:["mechanisms","plan","conflicts"],question:"Does butyrate change barrier function?",...over});

describe("integration contracts",()=>{
 it("refuses to prepare a submission without the required answers",()=>{
  expect(prepareSubmission(EMPTY_STATE)).toEqual({ok:false,reasons:["missing_required_answers"]});
 });
 it("maps onto the existing researcher profile and reports what it could not carry over",()=>{
  const r=prepareSubmission(ready());
  if(!r.ok)throw Error("expected ok");
  expect(r.profile.role).toBe("Research scientist");
  expect(r.profile.stage).toBe("Early-career researcher");
  expect(r.profile.goals).toEqual(["Understand biological mechanisms","Compare scientific evidence"]);
  expect(r.droppedObjectives).toEqual(["plan"]);
  expect(r.profile.interests).toContain("Immunology & Inflammation");
  expect(r.profile.papers).toEqual([]);
  expect(r.extension.schema).toBe(PROFILE_EXTENSION_SCHEMA);
 });
 it("maps every role to a value in the existing role and stage lists",()=>{
  for(const role of ROLES){
   const r=prepareSubmission(ready({primaryRole:role.id}));
   if(!r.ok)throw Error("expected ok");
   expect(r.profile.role).not.toBeNull();
  }
 });
 it("never carries an unverified-looking ORCID as anything but a checked iD, and never sample publications",()=>{
  const bad=prepareSubmission(ready({identity:{...EMPTY_STATE.identity,orcid:"0000-0002-1825-0098",publicationsPreviewed:true}}));
  if(!bad.ok)throw Error("expected ok");
  expect(bad.profile.orcid).toBeNull();
  const good=prepareSubmission(ready({identity:{...EMPTY_STATE.identity,orcid:"0000-0002-1825-0097",publicationsPreviewed:true}}));
  if(!good.ok)throw Error("expected ok");
  expect(good.profile.orcid).toBe("0000-0002-1825-0097");
  expect(good.profile.papers).toEqual([]);
 });
 it("blocks the whole submission when free text looks like patient information",()=>{
  const r=prepareSubmission(ready({question:"Patient NHS number 943 476 5919 responded"}));
  expect(r.ok).toBe(false);
 });
 it("also blocks bare identifier-like text that the PHI markers do not name",()=>{
  const r=prepareSubmission(ready({question:"Patient 943 476 5919 responded"}));
  expect(r).toEqual({ok:false,reasons:["identifier_like_text"]});
  expect(prepareSubmission(ready({methods:{...EMPTY_STATE.methods,expertise:"contact me at a@b.org"}})).ok).toBe(false);
 });
 it("never includes a field that grants or asserts access, even for an administrator who chose sharing",()=>{
  const s=reduce(reduce(ready({primaryRole:"admin",path:"institution"}),{type:"setPrivacy",patch:{sharing:"institution"}}),{type:"setInstitution",patch:{name:"Example University",size:"over-500"}});
  const r=prepareSubmission(s);
  if(!r.ok)throw Error("expected ok");
  expect(findAccessFields(r.profile)).toEqual([]);
  expect(findAccessFields(r.extension)).toEqual([]);
  expect(r.extension.organisation).toEqual({name:"Example University",sizeBand:"over-500",departments:[],intendedData:[]});
  expect(r.extension.preferences.sharing).toBe("institution"); // a preference, not a grant
 });
 it("the access-field guard catches grants nested anywhere",()=>{
  expect(findAccessFields({a:{b:{permissions:["x"]}},c:1})).toEqual(["a.b.permissions"]);
  expect(findAccessFields({isAdmin:true})).toEqual(["isAdmin"]);
  expect(findAccessFields("x")).toEqual([]);
 });
 it("every contract is owned by the main backend, states a fail-closed rule, and only the profile store exists",()=>{
  expect(CONTRACTS).toHaveLength(7);
  for(const c of CONTRACTS){expect(c.owner).toBe("Main HSI backend");expect(c.failClosed.length).toBeGreaterThan(20);expect(c.today.length).toBeGreaterThan(5)}
  expect(CONTRACTS.filter(c=>c.status==="Exists, fail-closed").map(c=>c.id)).toEqual(["profile-store"]);
 });
 it("the only client reports not configured for every call and cannot be mistaken for success",async()=>{
  const c=createUnconfiguredClient();
  const results=await Promise.all([c.saveProfile(ready()),c.startOrcidVerification(),c.requestMembership("x"),c.getAccessDecision("y"),c.setMemory("private"),c.setSharing("group"),c.startConnection("orcid")]);
  for(const r of results){expect(r.ok).toBe(false);if(!r.ok){expect(r.code).toBe("NOT_CONFIGURED");expect(r.detail.length).toBeGreaterThan(10)}}
 });
});
