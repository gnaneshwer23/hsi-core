/** Node-only draft preparation. References existing seeds; never treats their labels as new indication approval. */
import {createHash} from "node:crypto";
import type {HsiEdge} from "../schema";
import {coverageCanonical,parseResearchCoverageCatalogue,validateCoverageProtocol,parseRegistrySnapshot,coverageReadiness,type ResearchCoverageCatalogue,type CoverageProtocol,type RegistrySnapshot} from "../researchCoverage";
export function buildResearchCoverage(input:{protocols:unknown;edges:readonly HsiEdge[];inputs:ResearchCoverageCatalogue["inputs"];registry:RegistrySnapshot|null}):ResearchCoverageCatalogue{
 const raw=input.protocols as {schemaVersion:string;protocols:CoverageProtocol[]};
 if(!raw||Object.keys(raw).sort().join(",")!=="protocols,schemaVersion"||raw.schemaVersion!=="hsi-coverage-protocols-1"||!Array.isArray(raw.protocols))throw Error("Invalid draft protocol input");
 const packs=raw.protocols.map(p=>{validateCoverageProtocol(p);return {...structuredClone(p),status:"protocol_draft" as const,scientificReview:"unreviewed" as const,releaseEligible:false as const,graphPromotable:false as const,background:p.backgroundEdgeIds.map(id=>{
  const e=input.edges.find(e=>e.id===id);if(!e)throw Error("Unknown existing background edge");
  const sourcePath=id.startsWith("HSI-E-GUT-")?"src/seed/gutScfaMucosal.ts":id.startsWith("HSI-E-NI-")?"src/seed/neuroVagusCholinergic.ts":"src/seed/t2dImmunoMetabolic.ts",sourceVersion=input.inputs.find(i=>i.path===sourcePath)?.sha256;
  if(!sourceVersion)throw Error("Missing seed input hash");
  return {seedEdgeId:e.id,subjectId:e.subjectId,subjectLabel:e.subjectLabel,predicate:e.edgeType,objectId:e.objectId,objectLabel:e.objectLabel,pmid:e.provenance?.pmid??null,citationLabel:e.provenance?.citationLabel??null,sourcePath,sourceVersion,contextNote:e.provenance?.notes??"No study-specific context recorded; human extraction required.",relation:"background_context_only" as const,sourceStatus:"repository_locator_unverified" as const,rights:"unverified" as const,scientificReview:"unreviewed" as const,supportsIndication:false as const,passageText:null};
 })}});
 if(input.registry){parseRegistrySnapshot(input.registry);const {version,...body}=input.registry;if(createHash("sha256").update(coverageCanonical(body)).digest("hex")!==version)throw Error("Registry snapshot hash mismatch")}
 const body={schemaVersion:"hsi-research-coverage-1" as const,status:"protocol_drafts" as const,containsPhi:false as const,clinicalAdvice:false as const,graphPromotable:false as const,releaseEligible:false as const,inputs:structuredClone(input.inputs),packs,registry:structuredClone(input.registry)};
 return parseResearchCoverageCatalogue({...body,version:createHash("sha256").update(coverageCanonical(body)).digest("hex")});
}
export function coverageReviewPacket(c:ResearchCoverageCatalogue){parseResearchCoverageCatalogue(c);return {schemaVersion:"hsi-coverage-review-preparation-1",catalogueVersion:c.version,scope:"preparation_only",scientificApprovalGranted:false,packs:c.packs.map(p=>({...coverageReadiness(p),question:p.question,disease:p.disease,sourcePointers:p.background.map(b=>({seedEdgeId:b.seedEdgeId,pmid:b.pmid,relation:b.relation,contextNote:b.contextNote})),labelStore:[],assignedReviewer:null})),note:"No human decisions or role grants are created. Complete accountable source-rights, context, scientific, graph, permission, brief and product acceptance separately."}}
