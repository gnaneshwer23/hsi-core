import {describe,expect,test} from "bun:test";
import type {DomainEdge} from "../src/knowledgeGraph/domainGraph";
import {buildEvidenceContextPassport,EDGE_PASSPORT_FIELDS,PASSAGE_ONLY_PASSPORT_FIELDS} from "../src/knowledgeGraph/evidenceContextPassport";

const edge=(over:Partial<DomainEdge>={}):DomainEdge=>({
 id:"edge-1",
 subjectId:"n1",
 objectId:"n2",
 predicate:"associated_with",
 kind:"source_candidate",
 sourceId:"src-1",
 assertion:"Candidate association under study.",
 domains:["immunology"],
 conditions:["Systemic sclerosis"],
 model:"human_in_vivo",
 design:"Human observational cohort",
 tissue:"skin",
 population:null,
 assay:"ELISA",
 timepoint:null,
 intervention:null,
 outcome:"IL-21 elevation",
 limitations:"Repository annotation only; not independently verified.",
 contextStatus:"repository_annotation_not_reverified",
 negated:false,
 scopeWarnings:[],
 reviewStatus:"unreviewed",
 confidence:"not_calibrated",
 scientificClaimAllowed:false,
 ...over,
});

describe("evidence context passport",()=>{
 test("reports present edge fields and keeps missing fields explicit",()=>{
  const passport=buildEvidenceContextPassport(edge());
  expect(passport.schemaVersion).toBe("hsi-evidence-context-passport-1");
  expect(passport.scientificApproval).toBe(false);
  expect(passport.graphPromotable).toBe(false);
  expect(passport.needsHumanReview).toBe(true);
  expect(passport.fields.map(f=>f.id)).toEqual([...EDGE_PASSPORT_FIELDS,...PASSAGE_ONLY_PASSPORT_FIELDS]);
  const tissue=passport.fields.find(f=>f.id==="tissue")!;
  expect(tissue).toMatchObject({status:"reported",value:"skin"});
  const population=passport.fields.find(f=>f.id==="population")!;
  expect(population).toMatchObject({status:"not_stated",value:null});
  expect(population.missingReason).toContain("Population");
  const dose=passport.fields.find(f=>f.id==="dose")!;
  expect(dose).toMatchObject({status:"not_extracted",source:"snapshot_gap"});
  expect(passport.missingFieldIds).toContain("population");
  expect(passport.missingFieldIds).toContain("dose");
  expect(passport.missingFieldIds).not.toContain("tissue");
 });

 test("marks unspecified study system as not stated",()=>{
  const passport=buildEvidenceContextPassport(edge({model:"unspecified",tissue:null,population:null,assay:null,timepoint:null,intervention:null,outcome:null,conditions:[]}));
  expect(passport.fields.find(f=>f.id==="studySystem")).toMatchObject({status:"not_stated",value:null});
  expect(passport.fields.find(f=>f.id==="diseaseContexts")).toMatchObject({status:"not_stated"});
  expect(passport.missingCount).toBeGreaterThan(0);
 });
});
