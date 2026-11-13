/**
 * P2 fixture mode: runs the real context-audit pipeline end to end on recorded, synthetic inputs with no network,
 * no credentials and no live model. Search, extraction and entailment outputs are replayed from a fixture file by
 * content, so a run is reproducible: the same fixture yields the same audit hash. Live mode (approved sources and an
 * approved model deployment) swaps only the injected search and model runners; nothing here changes.
 * Fixture sources are synthetic: they are shaped as public publications only because the audit engine requires that
 * shape, and every output carries FIXTURE_NOTICE. Nothing produced here is evidence, approved, or promotable.
 */
import {createHash} from "node:crypto";
import {createContextConflictAuditRunner,renderContextConflictAudit,type ContextAuditHit,type ContextAuditSearch,type ContextAuditTarget,type ContextConflictAudit} from "./evidence/contextConflictAudit";
import {createModelEvidenceExtractor,type ExtractionModelRunner,type ExtractionRejection} from "./evidence/modelEvidenceExtraction";
import {createEntailmentVerifier} from "./evidence/entailmentVerifier";
import {createAuditFileStore} from "./evidence/auditFileStore";
import type {EntailmentModelRunner} from "./researchV2/modelEntailment";
import type {IndependentChallenge} from "./researchV2/scientificEntailment";
import {isInvestigationScopeId,type InvestigationScopeId} from "./investigationScope";

export const FIXTURE_NOTICE="FIXTURE RUN: synthetic passages and recorded model outputs. This is not evidence, not a scientific result and not an approved or promotable claim.";
export type RunnerFixtureHit={id:string;title:string;locator:string;text:string};
export type RunnerFixture={
 schemaVersion:"hsi-runner-fixture-1";id:string;scope:InvestigationScopeId;question:string;notice:string;
 searches:{support:RunnerFixtureHit[];oppose:RunnerFixtureHit[]};
 recorded:{extraction:Record<string,unknown>;entailment:Record<string,Record<string,unknown>>};
};
export type InvestigationRunResult={
 mode:"fixture";notice:string;audit:ContextConflictAudit;entailments:IndependentChallenge[];rejections:ExtractionRejection[];brief:string;
};
const sha=(text:string)=>createHash("sha256").update(text).digest("hex");

export function validateRunnerFixture(value:unknown):RunnerFixture{
 const f=value as RunnerFixture;
 if(!f||f.schemaVersion!=="hsi-runner-fixture-1"||!/^[a-z0-9][a-z0-9-]{2,63}$/.test(f.id)||!isInvestigationScopeId(f.scope)||typeof f.question!=="string"||f.question.length<5||f.question.length>500)throw Error("Invalid runner fixture");
 if(typeof f.notice!=="string"||!/synthetic/i.test(f.notice))throw Error("Fixture must declare itself synthetic");
 const hits=[...f.searches.support,...f.searches.oppose];
 if(!hits.length||hits.length>16||new Set(hits.map(h=>h.id)).size!==hits.length||hits.some(h=>!/^[a-z0-9][a-z0-9-]{0,63}$/.test(h.id)||!h.text||h.text.length<40||h.text.length>3000||!h.title||!h.locator))throw Error("Invalid fixture hits");
 return f;
}
function toHit(fixture:RunnerFixture,hit:RunnerFixtureHit):ContextAuditHit{
 const sourceId="fixture-source-"+hit.id,version="1";
 return {
  id:hit.id,clearanceReceiptId:"fixture-clearance-"+hit.id,
  source:{id:sourceId,title:"SYNTHETIC FIXTURE (not a real publication): "+hit.title,kind:"publication",dataClass:"public_real",pmid:null,doi:null,url:"https://example.org/fixture/"+fixture.id+"/"+hit.id,
   licence:{status:"permitted",identifier:"synthetic-fixture",passageUsePermitted:true},
   provenance:{product:"hsi",datasetId:"synthetic-fixture-"+fixture.id,version,retrievedAt:"2026-11-13T00:00:00Z"}},
  passage:{id:sourceId+":p1",sourceId,sourceVersion:version,text:hit.text,locator:hit.locator,dataClass:"public_real",sha256:sha(hit.text)},
 };
}
function replayRunners(fixture:RunnerFixture,hits:readonly RunnerFixtureHit[]){
 const idByText=new Map(hits.map(h=>[h.text,h.id]));
 const extraction:ExtractionModelRunner=async req=>{
  const id=idByText.get(req.passage),out=id?fixture.recorded.extraction[id]:undefined;
  if(out===undefined)throw Error("No recorded extraction for this passage");return structuredClone(out);
 };
 const entailment=(verifierId:string):EntailmentModelRunner=>async req=>{
  const id=idByText.get(req.passage),out=id?fixture.recorded.entailment[verifierId]?.[id]:undefined;
  if(out===undefined)throw Error("No recorded entailment for this passage");return structuredClone(out);
 };
 return {extraction,entailment};
}

export async function runFixtureInvestigation(input:{fixture:unknown;storeDirectory?:string;verifierIds?:readonly string[];now?:()=>string}):Promise<InvestigationRunResult>{
 const fixture=validateRunnerFixture(input.fixture);
 const hitsByIntent={support:fixture.searches.support.map(h=>toHit(fixture,h)),oppose:fixture.searches.oppose.map(h=>toHit(fixture,h))};
 const all=[...fixture.searches.support,...fixture.searches.oppose];
 const replay=replayRunners(fixture,all);
 const rejections:ExtractionRejection[]=[],entailments:IndependentChallenge[]=[];
 const store=input.storeDirectory?createAuditFileStore(input.storeDirectory):null;
 const memory:ContextConflictAudit[]=[];
 const verifierIds=input.verifierIds??Object.keys(fixture.recorded.entailment);
 const runner=createContextConflictAuditRunner({
  enabled:true,now:input.now,
  search:async(_target,intent):Promise<ContextAuditSearch>=>{
   const hits=hitsByIntent[intent];
   return {intent,status:hits.length?"completed_bounded":"successful_empty",queriedAt:"2026-11-13T00:00:00Z",queryHash:sha(intent+"|"+fixture.question),sourceIds:hits.map(h=>h.source.id),hits:structuredClone(hits)};
  },
  authorizePassage:async hit=>hit.source.licence.passageUsePermitted===true&&hit.source.url!==null&&hit.source.url.startsWith("https://example.org/fixture/"),
  extract:createModelEvidenceExtractor({runner:replay.extraction,onRejection:r=>rejections.push(r)}),
  verify:createEntailmentVerifier({verifiers:verifierIds.map(id=>({verifierId:id,modelId:"recorded-"+id,runner:replay.entailment(id)})),onChallenges:c=>entailments.push(...c)}),
  append:async(artifact,previous)=>{if(store)await store.append(artifact,previous);else memory.push(structuredClone(artifact))},
 });
 const target:ContextAuditTarget={investigationId:"fixture-"+fixture.id,diseaseScope:fixture.scope,question:fixture.question,release:{id:"fixture-release-"+fixture.id,version:"1",manifestHash:sha(JSON.stringify(fixture))}};
 const previous=store?await store.latest(target.investigationId):null;
 const audit=await runner.run(target,previous??undefined);
 const lines=[
  "# "+FIXTURE_NOTICE,"",
  renderContextConflictAudit(audit,"markdown"),"",
  "## Independent entailment challenges",
  ...(entailments.length?entailments.map(c=>`- ${c.claimId} / ${c.verifierId}: ${c.verdict}${c.evidenceSpan?` (quote: "${c.evidenceSpan}")`:""}`):["- none recorded"]),"",
  "## Extraction rejections (failure ledger)",
  ...(rejections.length?rejections.map(r=>`- ${r.hitId} / ${r.field}: ${r.reason}`):["- none"]),"",
  "Human scientific review is required. Consensus is not established. Not approved, not promotable.",
 ];
 return {mode:"fixture",notice:FIXTURE_NOTICE,audit,entailments,rejections,brief:lines.join("\n")};
}
