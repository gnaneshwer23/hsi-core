import {describe,it,expect} from "bun:test";
import {contextUnit} from "./fixtures/contextConflictAudit";
import {buildPassageLinkedContext,normalizeContextValue,comparePassageLinkedContexts,validatePassageLinkedContext} from "../src/evidence/passageLinkedContext";
import {compareEvidenceUnits} from "../src/evidence/structuredEvidenceComparison";
import {reportContextConflict} from "../src/evidence/contextConflictAudit";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {fixtureHash} from "./fixtures/contextConflictAudit";
describe("passage-linked detailed comparison",()=>{
 it("normalizes exact quantities without crossing concentration dimensions",()=>{
  expect(normalizeContextValue("dose","0.1 uM")).toEqual({kind:"quantity",value:"100",unit:"nM"});
  expect(normalizeContextValue("dose","1000 pM")).toEqual({kind:"quantity",value:"1",unit:"nM"});
  expect(normalizeContextValue("dose","1 mg/mL")).toEqual({kind:"quantity",value:"1000000",unit:"ng/mL"});
  expect(normalizeContextValue("timing","1 day")).toEqual(normalizeContextValue("timing","24 h"));
  expect(normalizeContextValue("dose","low dose")).toBeNull();
 });
 it("preserves original spans and treats equivalent units/taxa as the same context",()=>{
  const a=contextUnit("a"),b=contextUnit("b",{dose:"1000 nM",timing:"1 day",species:"Homo sapiens"});
  const result=compareEvidenceUnits({left:a.unit,right:b.unit});
  expect(result.outcome).toBe("potential_contradiction");expect(reportContextConflict(result).classification).toBe("potential_conflict");
  expect(a.unit.detailedContext!.fields.dose.originalText).toBe("1 uM");
  expect(a.passage.text.slice(a.unit.detailedContext!.fields.dose.span!.start,a.unit.detailedContext!.fields.dose.span!.end)).toBe("1 uM");
  expect(result.graphPromotable).toBe(false);
 });
 it("gates polarity on missingness, estimand, units, methods and entity alignment",()=>{
  const a=contextUnit("a");
  for(const [b,expected] of [[contextUnit("b",{},["species"]),"insufficient_evidence"],[contextUnit("b",{estimand:"survival risk ratio"}),"insufficient_comparability"],[contextUnit("b",{dose:"1 ng/mL"}),"insufficient_comparability"],[contextUnit("b",{assay:"RNA sequencing"}),"methodological_difference"],[contextUnit("b",{tissueCompartment:"lung"}),"context_dependent"]] as const)expect(compareEvidenceUnits({left:a.unit,right:b.unit}).outcome).toBe(expected);
  const b=contextUnit("b");b.unit.object.value="different-entity";expect(compareEvidenceUnits({left:a.unit,right:b.unit}).outcome).toBe("insufficient_comparability");
 });
 it("rejects changed text/hash/spans and rehashed fabricated normalization",()=>{
  const a=contextUnit("a");
  expect(()=>buildPassageLinkedContext({...a,clearanceReceiptId:"fixture",passage:{...a.passage,text:a.passage.text+"changed"}})).toThrow();
  const forged=structuredClone(a.unit.detailedContext!);forged.fields.species.normalized={kind:"ontology",system:"NCBITaxon",value:"10090"};const {contextHash,...body}=forged;forged.contextHash=fixtureHash(canonicalEvidenceJson(body));
  expect(()=>validatePassageLinkedContext(forged)).toThrow("normalization");
  const b=contextUnit("b");b.unit.evidenceSourceIds=["other-source"];expect(()=>compareEvidenceUnits({left:a.unit,right:b.unit})).toThrow("outside");
 });
 it("five-class reporting does not turn coarse metadata or causal bridges into conclusions",()=>{
  const a=contextUnit("a"),b=contextUnit("b");a.unit.predicate=b.unit.predicate="causes";
  expect(reportContextConflict(compareEvidenceUnits({left:a.unit,right:b.unit})).classification).toBe("insufficient_evidence");
  const c=contextUnit("c");delete c.unit.detailedContext;expect(reportContextConflict(compareEvidenceUnits({left:contextUnit("a").unit,right:c.unit})).classification).toBe("insufficient_evidence");
 });
});
