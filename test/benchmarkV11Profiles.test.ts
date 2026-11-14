import {describe,expect,test} from "bun:test";
import {deriveTranslationLabel,scoreDecomposition,strataKey,validatePooledClaim,validateTranslationPair,type PooledClaimProfile,type StratumKey,type TranslationPairProfile} from "../src/evidence/benchmarkV11Profiles";

// Structural fixtures only: placeholder text, not claims, not gold.
const pair=(over:Partial<TranslationPairProfile>={}):TranslationPairProfile=>({profile:"translation_pair",slotId:"IMMUNO-mechanism_context-01",
 preclinical:{claim:"<placeholder preclinical claim>",species:"<species>",modelSystem:"<model>",tissue:"<tissue>",intervention:"<intervention>",readout:"<readout>",evidenceIds:["e1","e2"]},
 human:{claim:"<placeholder human claim>",population:"<population>",design:"randomised_trial",outcome:"failed",evidenceIds:["h1"]},
 contextBoundary:["<context where it holds>"],translationLabel:"failed_translation",...over});
const k=(species:string,tissue:string,subset:string|null=null,stage:string|null=null,design="<design>"):StratumKey=>({species,tissue,populationSubset:subset,diseaseStage:stage,design});
const pooled=():PooledClaimProfile=>({profile:"pooled_claim_decomposition",slotId:"IMMUNO-mechanism_context-02",pooledClaim:"<placeholder pooled claim>",strata:[
 {key:k("human","synovium"),direction:"supports",evidenceIds:["a1","a2","a3"]},
 {key:k("mouse","joint"),direction:"supports",evidenceIds:["b1","b2"]},
 {key:k("human","blood","subset-x"),direction:"opposes",evidenceIds:["c1"]}]});

describe("translation_pair profile",()=>{
 test("accepts a failed translation that states its context boundary",()=>{expect(()=>validateTranslationPair(pair())).not.toThrow()});
 test("derives the label from the human outcome and rejects a mismatch",()=>{
  expect(deriveTranslationLabel("harmful")).toBe("harmful_translation");
  expect(()=>validateTranslationPair(pair({translationLabel:"translated"}))).toThrow("label");
 });
 test("a failed, mixed or harmful outcome without a context boundary is refused",()=>{
  for(const outcome of ["failed","mixed","harmful"] as const)expect(()=>validateTranslationPair(pair({human:{...pair().human,outcome},translationLabel:deriveTranslationLabel(outcome),contextBoundary:[]}))).toThrow("context boundary");
 });
 test("not-tested has no design or evidence; a tested outcome needs both",()=>{
  expect(()=>validateTranslationPair(pair({human:{...pair().human,outcome:"not_tested",design:"none",evidenceIds:[]},translationLabel:"untested",contextBoundary:[]}))).not.toThrow();
  expect(()=>validateTranslationPair(pair({human:{...pair().human,outcome:"not_tested"},translationLabel:"untested"}))).toThrow("not-tested");
  expect(()=>validateTranslationPair(pair({human:{...pair().human,design:"none"}}))).toThrow("design");
  expect(()=>validateTranslationPair(pair({human:{...pair().human,evidenceIds:[]}}))).toThrow("evidence");
 });
 test("requires preclinical context fields, unique evidence ids and a valid slot",()=>{
  expect(()=>validateTranslationPair(pair({preclinical:{...pair().preclinical,species:""}}))).toThrow("species");
  expect(()=>validateTranslationPair(pair({preclinical:{...pair().preclinical,evidenceIds:["e1","e1"]}}))).toThrow("unique");
  expect(()=>validateTranslationPair(pair({slotId:"free-text"}))).toThrow("slot");
 });
});

describe("pooled_claim_decomposition profile and scorer",()=>{
 test("accepts a multi-stratum claim; refuses one stratum, duplicates and a study in two strata",()=>{
  expect(()=>validatePooledClaim(pooled())).not.toThrow();
  expect(()=>validatePooledClaim({...pooled(),strata:[pooled().strata[0]!]})).toThrow("2 to 24");
  expect(()=>validatePooledClaim({...pooled(),strata:[pooled().strata[0]!,{...pooled().strata[0]!,key:k("HUMAN","Synovium")}]})).toThrow("Duplicate");
  const dup=pooled();dup.strata[1]!.evidenceIds=["a1"];expect(()=>validatePooledClaim(dup)).toThrow("only one stratum");
 });
 test("stratum keys ignore case and spacing",()=>{expect(strataKey(k(" Human ","Synovium"))).toBe(strataKey(k("human","synovium")))});
 test("a perfect breakdown scores full recall, precision, counts and directions",()=>{
  const g=pooled(),s=scoreDecomposition(g,g.strata.map(x=>({key:x.key,direction:x.direction,studyCount:x.evidenceIds.length})));
  expect(s).toMatchObject({matched:3,stratumRecall:1,stratumPrecision:1,countExact:3,directionCorrect:3,flattened:false});
 });
 test("a flattened answer is detected and scores zero recall on the missing strata",()=>{
  const g=pooled(),s=scoreDecomposition(g,[{key:k("any","any"),direction:"supports",studyCount:6}]);
  expect(s.flattened).toBe(true);expect(s.matched).toBe(0);expect(s.stratumRecall).toBe(0);expect(s.unmatchedGold.length).toBe(3);
 });
 test("wrong counts, wrong directions and invented strata are each counted separately",()=>{
  const g=pooled(),s=scoreDecomposition(g,[{key:g.strata[0]!.key,direction:"opposes",studyCount:4},{key:g.strata[1]!.key,direction:"supports",studyCount:2},{key:k("rat","paw"),direction:"supports",studyCount:1}]);
  expect(s).toMatchObject({matched:2,countExact:1,directionCorrect:1,predictedStrata:3});expect(s.stratumPrecision).toBeCloseTo(2/3);expect(s.unmatchedPredicted.length).toBe(1);
 });
 test("a predicted breakdown that repeats a stratum is rejected",()=>{const g=pooled();expect(()=>scoreDecomposition(g,[{key:g.strata[0]!.key,direction:"supports",studyCount:1},{key:g.strata[0]!.key,direction:"supports",studyCount:2}])).toThrow("repeats")});
});
