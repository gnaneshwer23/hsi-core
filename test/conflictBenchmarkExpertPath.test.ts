import {describe,expect,test} from "bun:test";
import {mkdtempSync,mkdirSync,rmSync,writeFileSync,readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {parseConflictCase} from "../src/evidence/conflictBenchmark";
import {
  CONFLICT_FIXTURE_CASES,
  CONFLICT_FIXTURE_PREDICTIONS,
  CONFLICT_FIXTURE_REPORTS,
  assertExpertCases,
  assertExpertPathAllowed,
  assertFixturePathUnchanged,
  expertPathBlockedPayload,
  resolveConflictBenchPaths,
} from "../src/evidence/conflictBenchmarkExpertPath";
import {initLabelVault} from "../src/evidence/labelVault";

function tempRepo(){
  const root=mkdtempSync(join(tmpdir(),"hsi-conflict-expert-"));
  mkdirSync(join(root,"evaluation/conflict-benchmark/fixtures"),{recursive:true});
  mkdirSync(join(root,"site"),{recursive:true});
  return root;
}

describe("conflict benchmark expert path (A4.2)",()=>{
  test("default fixture paths stay on the public fixture tree",()=>{
    const root=tempRepo();
    try{
      const paths=resolveConflictBenchPaths({repoRoot:root,mode:"fixture"});
      expect(paths.casesPath.endsWith(CONFLICT_FIXTURE_CASES)).toBe(true);
      expect(paths.predictionPaths).toHaveLength(1);
      expect(paths.predictionPaths[0]!.endsWith(CONFLICT_FIXTURE_PREDICTIONS)).toBe(true);
      expect(paths.outDir.endsWith(CONFLICT_FIXTURE_REPORTS)).toBe(true);
      expect(()=>assertFixturePathUnchanged(paths.casesPath,paths.predictionPaths,paths.outDir,root)).not.toThrow();
    }finally{rmSync(root,{recursive:true,force:true})}
  });

  test("expert paths resolve only under the private vault",()=>{
    const root=tempRepo();
    try{
      initLabelVault(root);
      const paths=resolveConflictBenchPaths({repoRoot:root,mode:"expert"});
      expect(paths.casesPath.includes(".hsi-private-benchmark/conflict/cases.json")).toBe(true);
      expect(paths.outDir.includes(".hsi-private-benchmark/conflict/reports")).toBe(true);
      expect(()=>assertExpertPathAllowed(root,join(root,"site/public/report.json"))).toThrow(/public/);
      expect(()=>assertExpertPathAllowed(root,join(root,"evaluation/conflict-benchmark/fixtures/x.json"))).toThrow(/public/);
      expect(()=>resolveConflictBenchPaths({
        repoRoot:root,
        mode:"expert",
        casesOverride:join(root,CONFLICT_FIXTURE_CASES),
      })).toThrow(/public repository trees|synthetic fixture/);
    }finally{rmSync(root,{recursive:true,force:true})}
  });

  test("expert mode loads predictions from the vault predictions directory",()=>{
    const root=tempRepo();
    try{
      initLabelVault(root);
      const predDir=join(root,".hsi-private-benchmark/conflict/predictions");
      writeFileSync(join(predDir,"scite.json"),`${JSON.stringify({system:"Scite",method:"hand",predictions:[]})}\n`);
      writeFileSync(join(predDir,"elicit.json"),`${JSON.stringify({system:"Elicit",method:"hand",predictions:[]})}\n`);
      const paths=resolveConflictBenchPaths({repoRoot:root,mode:"expert"});
      expect(paths.predictionPaths.map(p=>p.split("/").at(-1))).toEqual(["elicit.json","scite.json"]);
    }finally{rmSync(root,{recursive:true,force:true})}
  });

  test("assertExpertCases refuses synthetic fixtures",()=>{
    const fixtures=(JSON.parse(readFileSync("evaluation/conflict-benchmark/fixtures/synthetic-cases.v1.json","utf8")) as unknown[]).map(parseConflictCase);
    expect(()=>assertExpertCases(fixtures)).toThrow(/synthetic_fixture/);
    const expert=parseConflictCase({
      id:"CB-001",
      question:"q",
      provenance:"expert_curated",
      records:[{sourceId:"a",citation:"c",model:"mouse",tissue:null,population:null,design:null,negated:false}],
      labels:[{raterId:"R1",label:"no_disagreement"},{raterId:"R2",label:"no_disagreement"}],
      adjudicated:null,
    });
    expect(()=>assertExpertCases([expert])).not.toThrow();
  });

  test("blocked expert payload stays honest",()=>{
    const blocked=expertPathBlockedPayload(".hsi-private-benchmark/conflict/cases.json");
    expect(blocked.status).toBe("BLOCKED");
    expect(blocked.fixtureUnchanged).toBe(true);
    expect(blocked.scientificApproval).toBe(false);
  });
});
