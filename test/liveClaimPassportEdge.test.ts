import {describe,expect,test} from "bun:test";
import {buildEvidenceContextPassport} from "../src/knowledgeGraph/evidenceContextPassport";
import {liveClaimToPassportEdge} from "../src/investigation/liveClaimPassportEdge";
import type {Candidate} from "../src/investigation/liveRun";

const candidate=(over:Partial<Candidate>={}):Candidate=>({
 id:"c1",
 relationId:"il21-tfh",
 subject:"IL-21",
 object:"T follicular helper cells",
 contexts:["ssc"],
 species:"human",
 sourceId:"s1",
 sourceUrl:"https://europepmc.org/article/MED/1",
 sentence:"IL-21 was increased and Tfh cells expanded in patients with systemic sclerosis.",
 state:"extracted_candidate",
 lexicalPolarity:"supporting",
 polarity:"supporting",
 polarityBasis:"two_model_challenge",
 direction:"positive",
 priority:{score:7,reasons:["States an effect or direction"]},
 verification:"agree_directional",
 verdicts:[],
 retraction:"not_flagged_by_provider",
 ...over,
});

describe("liveClaimToPassportEdge",()=>{
 test("maps live claim into passport with explicit missing fields",()=>{
  const edge=liveClaimToPassportEdge({
   candidate:candidate(),
   contextLabels:["Systemic sclerosis"],
  });
  expect(edge.id).toBe("live-claim:c1");
  expect(edge.kind).toBe("source_candidate");
  expect(edge.scientificClaimAllowed).toBe(false);
  expect(edge.model).toBe("human_in_vivo");
  expect(edge.conditions).toEqual(["Systemic sclerosis"]);
  expect(edge.tissue).toBeNull();
  expect(edge.outcome).toBeNull();

  const passport=buildEvidenceContextPassport(edge);
  expect(passport.scientificApproval).toBe(false);
  expect(passport.graphPromotable).toBe(false);
  expect(passport.fields.find(f=>f.id==="studySystem")).toMatchObject({status:"reported",value:"Human participants"});
  expect(passport.fields.find(f=>f.id==="diseaseContexts")).toMatchObject({status:"reported",value:"Systemic sclerosis"});
  expect(passport.fields.find(f=>f.id==="tissue")).toMatchObject({status:"not_stated",value:null});
  expect(passport.fields.find(f=>f.id==="dose")).toMatchObject({status:"not_extracted"});
  expect(passport.missingFieldIds).toContain("tissue");
  expect(passport.missingFieldIds).toContain("dose");
  expect(passport.note).toContain("not extracted");
 });

 test("unknown species stays unspecified / not stated on passport",()=>{
  const edge=liveClaimToPassportEdge({
   candidate:candidate({species:null,contexts:[],direction:"negative"}),
   contextLabels:[],
  });
  expect(edge.model).toBe("unspecified");
  expect(edge.negated).toBe(true);
  const passport=buildEvidenceContextPassport(edge);
  expect(passport.fields.find(f=>f.id==="studySystem")).toMatchObject({status:"not_stated"});
  expect(passport.fields.find(f=>f.id==="diseaseContexts")).toMatchObject({status:"not_stated"});
 });

 test("flagged retraction appears in limitations without inventing clearance",()=>{
  const edge=liveClaimToPassportEdge({
   candidate:candidate({retraction:"flagged"}),
   contextLabels:["Systemic sclerosis"],
  });
  expect(edge.limitations).toContain("retracted");
  expect(edge.limitations).toContain("licence/reuse not assessed");
 });
});
