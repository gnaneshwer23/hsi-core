/**
 * NEXUS composition, fixture mode: one run that chains the collective's parts in order and refuses what it must.
 *   WARDEN admit -> (SENTINEL freshness, when supplied) -> durable job -> audit (SCOUT/AEGIS/LANTERN/PARALLAX/VERITAS stand-ins)
 *   -> ARBITER packet -> ATLAS draft proposals -> VANTAGE gaps -> HELIX (only when explicitly enabled, runner injected).
 * It runs on recorded synthetic fixtures only; it has no live branch and every output stays unapproved and non-promotable.
 * A job that already completed is reported by its audit hash and is not re-run.
 */
import {runFixtureInvestigation,validateRunnerFixture,type InvestigationRunResult} from "./investigationRunner";
import {createWarden,WARDEN_CEILINGS,type WardenLimits} from "./warden";
import {createJobJournal,runDurable,type DurableOutcome} from "./nexusJobs";
import {buildReviewPacket,type ReviewPacket} from "./reviewPacket";
import {proposeEdgesFromAudit,type ProposalBatch} from "./atlasProposals";
import {proposeGaps,type VantageResult} from "./vantageGaps";
import {createHelix,type HelixResult,type MechanismRunner} from "./helixMechanism";
import type {createSentinel} from "./sentinel";

export type PipelineResult={
 mode:"fixture";job:DurableOutcome;
 run:InvestigationRunResult|null;packet:ReviewPacket|null;proposals:ProposalBatch|null;vantage:VantageResult|null;helix:HelixResult|null;
 graphPromotable:false;scientificApproval:false;notice:string;
};
export const PIPELINE_NOTICE="PIPELINE FIXTURE RUN: synthetic inputs, recorded model outputs. Packet, proposals, gaps and hypotheses are unapproved and not promotable; human review is required.";
const DEFAULT_LIMITS:WardenLimits={maxModelCalls:WARDEN_CEILINGS.maxModelCalls,maxRunsPerDay:WARDEN_CEILINGS.maxRunsPerDay,maxRequestsPerWindow:WARDEN_CEILINGS.maxRequestsPerWindow,windowMs:WARDEN_CEILINGS.windowMs};

export async function runCollectivePipeline(input:{
 fixture:unknown;storeDirectory:string;jobDirectory:string;
 limits?:WardenLimits;killed?:()=>boolean;sentinel?:ReturnType<typeof createSentinel>;
 helix?:{enabled:boolean;runner?:MechanismRunner};submitterId?:string;now?:()=>number;
}):Promise<PipelineResult>{
 const fixture=validateRunnerFixture(input.fixture);
 const journal=createJobJournal(input.jobDirectory,{now:input.now});
 const warden=createWarden({limits:input.limits??DEFAULT_LIMITS,killed:input.killed??(()=>false),runsToday:()=>journal.runsToday(),now:input.now});
 warden.admitRun();                       // kill switch and daily cap, before anything else
 input.sentinel?.assertFresh();           // stale clearances: refuse rather than rely on them
 type Parts=Omit<PipelineResult,"job"|"mode"|"graphPromotable"|"scientificApproval"|"notice">;
 const box:{parts:Parts|null}={parts:null};
 const job=await runDurable(journal,"pipeline-"+fixture.id,async()=>{
  const run=await runFixtureInvestigation({fixture,storeDirectory:input.storeDirectory,now:input.now?()=>new Date(input.now!()).toISOString():undefined});
  const packet=buildReviewPacket({audit:run.audit,entailments:run.entailments,rejections:run.rejections});
  const sourceUrls=Object.fromEntries(run.audit.units.flatMap(u=>u.evidenceSourceIds).map(id=>[id,"https://example.org/fixture/"+fixture.id+"/"+id.replace(/^fixture-source-/,"")]));
  const proposals=proposeEdgesFromAudit({audit:run.audit,submitterId:input.submitterId??"atlas:proposer",sourceUrls});
  const vantage=proposeGaps(run.audit);
  const helix=input.helix?.enabled?await createHelix({enabled:true,runner:input.helix.runner}).propose(run.audit):null;
  box.parts={run,packet,proposals,vantage,helix};
  return {auditHash:run.audit.auditHash};
 });
 const base={mode:"fixture" as const,job,graphPromotable:false as const,scientificApproval:false as const,notice:PIPELINE_NOTICE};
 return box.parts?{...base,...box.parts}:{...base,run:null,packet:null,proposals:null,vantage:null,helix:null};
}
