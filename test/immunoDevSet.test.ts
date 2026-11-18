import {describe,expect,test} from "bun:test";
import {execFileSync} from "node:child_process";
import {mkdtempSync,mkdirSync,readFileSync,rmSync,symlinkSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {
 appendImmunoDevCase,
 emptyImmunoDevSet,
 importImmunoDevSet,
 loadImmunoDevSet,
 refuseImmunoDevSetScoring,
 scaffoldImmunoDevCase,
 validateImmunoDevSet,
} from "../src/evidence/immunoDevSet";
import {buildImmunoProtocol} from "../src/evidence/immunoBenchmark";
import {createImmunoLockedEvaluator} from "../src/evidence/immunoBenchmarkAcceptance";
import {initLabelVault,labelVaultStatus,validateLabelVaultLayout} from "../src/evidence/labelVault";
import {fixtureCases} from "./fixtures/immunoBenchmark";

function tempRepo(){
 const root=mkdtempSync(join(tmpdir(),"hsi-immuno-dev-"));
 mkdirSync(join(root,"site"),{recursive:true});
 mkdirSync(join(root,"evaluation"),{recursive:true});
 mkdirSync(join(root,"src"),{recursive:true});
 mkdirSync(join(root,"docs"),{recursive:true});
 return root;
}

describe("immuno founder development set (A4.3)",()=>{
 test("vault init includes immuno dev-set layout and empty set validates",()=>{
  const root=tempRepo();
  try{
   initLabelVault(root);
   const status=validateLabelVaultLayout(root);
   expect(status.present).toBe(true);
   expect(status.caseCounts.immuno).toBe(0);
   const doc=loadImmunoDevSet(root);
   expect(doc.cases).toEqual([]);
   expect(validateImmunoDevSet(doc).caseCount).toBe(0);
   const manifest=JSON.parse(readFileSync(join(root,".hsi-private-benchmark/manifests/vault-manifest.v1.json"),"utf8"));
   expect(manifest.containsGoldLabels).toBe(false);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("scaffold writes gold-null drafts and refreshes counts without claiming gold",()=>{
  const root=tempRepo();
  try{
   const draft=scaffoldImmunoDevCase({
    caseId:"DEV-001",
    layer:"core",
    domain:"innate_adaptive_cells",
    question:"What does the graph record about Treg induction in this development worksheet?",
   });
   expect(draft.gold).toBeNull();
   const written=appendImmunoDevCase(root,draft);
   expect(written.total).toBe(1);
   expect(labelVaultStatus(root).caseCounts.immuno).toBe(1);
   const manifest=JSON.parse(readFileSync(join(root,".hsi-private-benchmark/manifests/vault-manifest.v1.json"),"utf8"));
   expect(manifest.containsGoldLabels).toBe(false);
   expect(manifest.caseCounts.immuno).toBe(1);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("import validates, merges without overwrite, and refuses public or floor-bearing sources",()=>{
  const root=tempRepo();
  try{
   initLabelVault(root);
   const good=emptyImmunoDevSet();
   good.cases.push(scaffoldImmunoDevCase({
    caseId:"DEV-002",
    layer:"disease",
    domain:"ssc",
    question:"Development-only SSc worksheet question for schema import.",
   }));
   const source=join(root,"offline-dev-set.json");
   writeFileSync(source,`${JSON.stringify(good,null,2)}\n`);
   const imported=importImmunoDevSet(root,source);
   expect(imported.summary.caseCount).toBe(1);
   expect(imported.merged).toBe(1);

   expect(()=>importImmunoDevSet(root,source)).toThrow(/overwrite existing case/);

   const slot=buildImmunoProtocol().slots[0]!;
   const holdoutPayload={
    ...emptyImmunoDevSet(),
    cases:[{
     ...scaffoldImmunoDevCase({
      caseId:"BAD-HOLD",
      layer:slot.layer,
      domain:slot.domain,
      question:"Must not use a holdout slot id.",
     }),
     slotId:slot.slotId,
    }],
   };
   const badSource=join(root,"bad-holdout.json");
   writeFileSync(badSource,`${JSON.stringify(holdoutPayload,null,2)}\n`);
   expect(()=>importImmunoDevSet(root,badSource)).toThrow(/Holdout slot|slotId/);

   for(const dir of ["evaluation","docs","research"]){
    mkdirSync(join(root,dir),{recursive:true});
    const publicPath=join(root,dir,"leaked.json");
    writeFileSync(publicPath,`${JSON.stringify(good,null,2)}\n`);
    expect(()=>importImmunoDevSet(root,publicPath)).toThrow(/public repository/);
   }

   const withFloors={
    ...emptyImmunoDevSet(),
    numericFloors:{overall:0.9},
    cases:[scaffoldImmunoDevCase({
     caseId:"DEV-FLOOR",
     layer:"core",
     domain:"cytokines_resolution",
     question:"Floors must stay null on the founder development set.",
    })],
   };
   const floorSource=join(root,"floors.json");
   writeFileSync(floorSource,`${JSON.stringify(withFloors,null,2)}\n`);
   expect(()=>importImmunoDevSet(root,floorSource)).toThrow(/numericFloors/);
   expect(loadImmunoDevSet(root).cases.map(c=>c.caseId)).toEqual(["DEV-002"]);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("symlinked vault targets are refused",()=>{
  const root=tempRepo();
  try{
   initLabelVault(root);
   const publicTarget=join(root,"evaluation","public-cases.json");
   writeFileSync(publicTarget,"[]\n");
   const link=join(root,".hsi-private-benchmark/immuno/dev-set/cases.json");
   rmSync(link,{force:true});
   symlinkSync(publicTarget,link);
   expect(()=>appendImmunoDevCase(root,scaffoldImmunoDevCase({
    caseId:"DEV-LINK",
    layer:"core",
    domain:"innate_adaptive_cells",
    question:"Symlink escape must fail closed.",
   }))).toThrow(/symlink|escapes|public/);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("score CLI exits nonzero while locked evaluator stays disabled",async()=>{
  const root=tempRepo();
  try{
   appendImmunoDevCase(root,scaffoldImmunoDevCase({
    caseId:"DEV-005",
    layer:"governance",
    domain:"absent_evidence",
    question:"Scoring entry must refuse until floors exist.",
   }));
   expect(()=>refuseImmunoDevSetScoring(loadImmunoDevSet(root))).toThrow(/scoring is blocked/);
   let failed=false;
   try{
    execFileSync(process.execPath,[
     "--no-env-file",
     join(import.meta.dir,"../scripts/label-vault.ts"),
     "score-immuno-dev",
     "--root",
     root,
    ],{encoding:"utf8"});
   }catch(error){
    failed=true;
    const err=error as {status?:number;stderr?:string;stdout?:string};
    expect(err.status).not.toBe(0);
    const out=`${err.stdout??""}${err.stderr??""}`;
    expect(out).toMatch(/scoringBlocked|blocked/i);
   }
   expect(failed).toBe(true);
   const evaluator=createImmunoLockedEvaluator({
    enabled:false,
    authorize:async()=>false,
    evaluate:async()=>({}),
    assess:async()=>{throw Error("no")},
    verifyAssessment:async()=>false,
   });
   await expect(evaluator.run({} as never,new AbortController().signal)).rejects.toThrow(/disabled/);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("complete development ImmunoCase from fixtures validates when partition is development",()=>{
  const cases=fixtureCases().filter(c=>c.partition==="development");
  expect(cases.length).toBe(1);
  const summary=validateImmunoDevSet({...emptyImmunoDevSet(),cases});
  expect(summary.completeCount).toBe(1);
  expect(summary.numericFloors).toBeNull();
 });
});
