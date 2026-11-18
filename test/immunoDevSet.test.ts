import {describe,expect,test} from "bun:test";
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
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
 return root;
}

describe("immuno founder development set (A4.3)",()=>{
 test("vault init includes immuno dev-set layout",()=>{
  const root=tempRepo();
  try{
   initLabelVault(root);
   const status=validateLabelVaultLayout(root);
   expect(status.present).toBe(true);
   expect(status.caseCounts.immuno).toBe(0);
   const doc=JSON.parse(readFileSync(join(root,".hsi-private-benchmark/immuno/dev-set/cases.json"),"utf8"));
   expect(doc.schemaVersion).toBe("hsi-immuno-dev-set-1");
   expect(doc.scoringBlocked).toBe(true);
   expect(doc.numericFloors).toBeNull();
   expect(doc.floorsOwnerApproved).toBe(false);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("scaffold writes gold-null drafts and counts them",()=>{
  const root=tempRepo();
  try{
   const draft=scaffoldImmunoDevCase({
    caseId:"DEV-001",
    layer:"core",
    domain:"innate_adaptive_cells",
    question:"What does the graph record about Treg induction in this development worksheet?",
   });
   expect(draft.partition).toBe("development");
   expect(draft.slotId).toBeNull();
   expect(draft.gold).toBeNull();
   expect(draft.scoringBlocked).toBe(true);
   const written=appendImmunoDevCase(root,draft);
   expect(written.total).toBe(1);
   expect(labelVaultStatus(root).caseCounts.immuno).toBe(1);
   expect(()=>appendImmunoDevCase(root,draft)).toThrow(/already present/);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("import validates schema and refuses holdout slots and public sources",()=>{
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
   expect(imported.summary.scoringBlocked).toBe(true);

   const holdout=emptyImmunoDevSet();
   const slot=buildImmunoProtocol().slots[0]!;
   holdout.cases.push({
    ...scaffoldImmunoDevCase({
     caseId:"BAD-HOLD",
     layer:slot.layer,
     domain:slot.domain,
     question:"Must not use a holdout slot id.",
    }),
    slotId:slot.slotId,
   });
   const badSource=join(root,"bad-holdout.json");
   writeFileSync(badSource,`${JSON.stringify(holdout,null,2)}\n`);
   expect(()=>importImmunoDevSet(root,badSource)).toThrow(/Holdout slot|slotId/);

   const publicPath=join(root,"evaluation","leaked.json");
   writeFileSync(publicPath,`${JSON.stringify(good,null,2)}\n`);
   expect(()=>importImmunoDevSet(root,publicPath)).toThrow(/public repository/);
  }finally{rmSync(root,{recursive:true,force:true})}
 });

 test("import rejects invented floors and scoring remains blocked",async()=>{
  const root=tempRepo();
  try{
   const withFloors={
    ...emptyImmunoDevSet(),
    numericFloors:{overall:0.9},
    cases:[scaffoldImmunoDevCase({
     caseId:"DEV-003",
     layer:"core",
     domain:"cytokines_resolution",
     question:"Floors must stay null on the founder development set.",
    })],
   };
   expect(()=>validateImmunoDevSet(withFloors as never)).toThrow(/numericFloors/);

   const approved={
    ...emptyImmunoDevSet(),
    floorsOwnerApproved:true as const,
    cases:[scaffoldImmunoDevCase({
     caseId:"DEV-004",
     layer:"core",
     domain:"mechanism_context",
     question:"Owner floors flag must stay false in A4.3 tooling.",
    })],
   };
   expect(()=>validateImmunoDevSet(approved as never)).toThrow(/floorsOwnerApproved/);

   initLabelVault(root);
   appendImmunoDevCase(root,scaffoldImmunoDevCase({
    caseId:"DEV-005",
    layer:"governance",
    domain:"absent_evidence",
    question:"Scoring entry must refuse until floors exist.",
   }));
   const doc=loadImmunoDevSet(root);
   expect(()=>refuseImmunoDevSetScoring(doc)).toThrow(/scoring is blocked/);
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
  const doc={
   ...emptyImmunoDevSet(),
   cases,
  };
  const summary=validateImmunoDevSet(doc);
  expect(summary.completeCount).toBe(1);
  expect(summary.draftCount).toBe(0);
  expect(summary.numericFloors).toBeNull();
 });
});
