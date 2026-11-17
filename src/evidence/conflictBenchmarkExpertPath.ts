/**
 * A4.2 expert path for HSI-BENCH-CONFLICT.
 *
 * Expert cases and reports live only under the gitignored label vault.
 * Synthetic fixtures stay on the public fixture path and must never mix in.
 */
import {existsSync,readdirSync} from "node:fs";
import {join,resolve,sep} from "node:path";
import {LABEL_VAULT_DIRNAME} from "./labelVault";
import type {ConflictCase} from "./conflictBenchmark";

export const CONFLICT_FIXTURE_CASES="evaluation/conflict-benchmark/fixtures/synthetic-cases.v1.json" as const;
export const CONFLICT_FIXTURE_PREDICTIONS="evaluation/conflict-benchmark/fixtures/synthetic-predictions.v1.json" as const;
export const CONFLICT_FIXTURE_REPORTS="evaluation/conflict-benchmark/reports/fixture" as const;

export const CONFLICT_EXPERT_CASES=`${LABEL_VAULT_DIRNAME}/conflict/cases.json` as const;
export const CONFLICT_EXPERT_PREDICTIONS_DIR=`${LABEL_VAULT_DIRNAME}/conflict/predictions` as const;
export const CONFLICT_EXPERT_REPORTS=`${LABEL_VAULT_DIRNAME}/conflict/reports` as const;

export type ConflictBenchMode="fixture"|"expert";

export type ConflictBenchPaths={
  mode:ConflictBenchMode;
  casesPath:string;
  predictionPaths:string[];
  outDir:string;
};

function under(root:string,rel:string):string{
  return resolve(root,rel);
}

function assertInside(root:string,target:string,label:string){
  const base=resolve(root)+sep;
  const resolved=resolve(target);
  if(resolved!==resolve(root)&&!resolved.startsWith(base))throw Error(`${label} escapes repository root`);
}

/** Refuse expert IO outside the private vault or into public evaluation/site trees. */
export function assertExpertPathAllowed(repoRoot:string,target:string){
  assertInside(repoRoot,target,"Expert path");
  const rel=resolve(target).slice(resolve(repoRoot).length+1).replaceAll("\\","/");
  if(rel.startsWith("site/")||rel.startsWith("evaluation/")||rel.startsWith("src/")||rel.startsWith("docs/")){
    throw Error("Expert conflict-bench path cannot use public repository trees");
  }
  if(!rel.startsWith(`${LABEL_VAULT_DIRNAME}/`)&&rel!==LABEL_VAULT_DIRNAME){
    throw Error(`Expert conflict-bench IO is restricted to ${LABEL_VAULT_DIRNAME}/`);
  }
}

export function assertFixturePathUnchanged(casesPath:string,predictionPaths:readonly string[],outDir:string,repoRoot:string){
  const wantCases=under(repoRoot,CONFLICT_FIXTURE_CASES);
  const wantPred=under(repoRoot,CONFLICT_FIXTURE_PREDICTIONS);
  const wantOut=under(repoRoot,CONFLICT_FIXTURE_REPORTS);
  if(resolve(casesPath)!==wantCases)throw Error("Fixture cases path must stay evaluation/conflict-benchmark/fixtures/synthetic-cases.v1.json");
  if(predictionPaths.length!==1||resolve(predictionPaths[0]!)!==wantPred){
    throw Error("Fixture predictions path must stay evaluation/conflict-benchmark/fixtures/synthetic-predictions.v1.json");
  }
  if(resolve(outDir)!==wantOut)throw Error("Fixture reports must stay under evaluation/conflict-benchmark/reports/fixture");
}

function listPredictionFiles(dir:string):string[]{
  if(!existsSync(dir))return [];
  return readdirSync(dir).filter(f=>f.endsWith(".json")).sort().map(f=>join(dir,f));
}

export function resolveConflictBenchPaths(input:{
  repoRoot:string;
  mode:ConflictBenchMode;
  casesOverride?:string;
  predictionOverrides?:string[];
  outOverride?:string;
}):ConflictBenchPaths{
  const root=resolve(input.repoRoot);
  if(input.mode==="fixture"){
    const paths:ConflictBenchPaths={
      mode:"fixture",
      casesPath:input.casesOverride?resolve(input.casesOverride):under(root,CONFLICT_FIXTURE_CASES),
      predictionPaths:input.predictionOverrides?.length
        ?input.predictionOverrides.map(p=>resolve(p))
        :[under(root,CONFLICT_FIXTURE_PREDICTIONS)],
      outDir:input.outOverride?resolve(input.outOverride):under(root,CONFLICT_FIXTURE_REPORTS),
    };
    if(!input.casesOverride&&!input.predictionOverrides?.length&&!input.outOverride){
      assertFixturePathUnchanged(paths.casesPath,paths.predictionPaths,paths.outDir,root);
    }
    return paths;
  }

  const casesPath=input.casesOverride?resolve(input.casesOverride):under(root,CONFLICT_EXPERT_CASES);
  const predictionPaths=input.predictionOverrides?.length
    ?input.predictionOverrides.map(p=>resolve(p))
    :listPredictionFiles(under(root,CONFLICT_EXPERT_PREDICTIONS_DIR));
  const outDir=input.outOverride?resolve(input.outOverride):under(root,CONFLICT_EXPERT_REPORTS);

  for(const p of [casesPath,outDir,...predictionPaths])assertExpertPathAllowed(root,p);

  // Expert mode must never point at the public fixture tree.
  const fixtureRoot=under(root,"evaluation/conflict-benchmark/fixtures");
  if(casesPath.startsWith(fixtureRoot+sep)||casesPath===fixtureRoot){
    throw Error("Expert mode cannot load synthetic fixture cases");
  }
  for(const p of predictionPaths){
    if(p.startsWith(fixtureRoot+sep)||p===fixtureRoot)throw Error("Expert mode cannot load synthetic fixture predictions");
  }

  return {mode:"expert",casesPath,predictionPaths,outDir};
}

/** Expert runs accept only expert_curated provenance. */
export function assertExpertCases(cases:readonly ConflictCase[]){
  if(cases.length===0)throw Error("Expert conflict-bench requires at least one case in the private vault");
  if(cases.some(c=>c.provenance!=="expert_curated")){
    throw Error("Expert conflict-bench refuses synthetic_fixture provenance");
  }
}

export function expertPathBlockedPayload(expectedCasesPath:string){
  return {
    benchmark:"HSI-BENCH-CONFLICT",
    mode:"expert",
    status:"BLOCKED",
    reason:"No expert-curated cases in the private vault yet",
    expected:expectedCasesPath,
    hint:"bun run label-vault:init && bun run label-vault:scaffold-conflict -- --id CB-001 --question \"...\"",
    fixtureUnchanged:true,
    scientificApproval:false,
  };
}
