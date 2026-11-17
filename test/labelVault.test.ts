import {describe,expect,test} from "bun:test";
import {mkdtempSync,readFileSync,rmSync,writeFileSync,mkdirSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {
  LABEL_VAULT_LAYOUT,
  appendConflictCaseStub,
  freezeConflictLabels,
  initLabelVault,
  labelVaultStatus,
  refusePublicWrite,
  scaffoldConflictCaseStub,
  validateLabelVaultLayout,
} from "../src/evidence/labelVault";

function tempRepo(){
  const root=mkdtempSync(join(tmpdir(),"hsi-label-vault-"));
  mkdirSync(join(root,"site"),{recursive:true});
  mkdirSync(join(root,"evaluation"),{recursive:true});
  return root;
}

describe("label vault (VER-05)",()=>{
  test("committed layout contract stays honest",()=>{
    expect(LABEL_VAULT_LAYOUT.schemaVersion).toBe("hsi-label-vault-layout-1");
    expect(LABEL_VAULT_LAYOUT.root).toBe(".hsi-private-benchmark");
    expect(LABEL_VAULT_LAYOUT.runtimeMayRead).toBe(false);
    expect(LABEL_VAULT_LAYOUT.scientificApproval).toBe(false);
    expect(LABEL_VAULT_LAYOUT.goldCommittedInGit).toBe(false);
    expect(LABEL_VAULT_LAYOUT.tracks.map(t=>t.id)).toEqual(["conflict","immuno","freezes","manifests"]);
    const committed=JSON.parse(readFileSync("evaluation/label-vault/LAYOUT.v1.json","utf8"));
    expect(committed.root).toBe(LABEL_VAULT_LAYOUT.root);
    expect(committed.goldCommittedInGit).toBe(false);
  });

  test("init creates the private layout and validate passes",()=>{
    const root=tempRepo();
    try{
      const {created}=initLabelVault(root,"2026-11-17T00:00:00.000Z");
      expect(created.some(p=>p.endsWith("conflict/cases.json"))).toBe(true);
      expect(JSON.parse(readFileSync(join(root,".hsi-private-benchmark/conflict/cases.json"),"utf8"))).toEqual([]);
      const status=validateLabelVaultLayout(root);
      expect(status.present).toBe(true);
      expect(status.caseCounts.conflict).toBe(0);
      expect(status.scientificApproval).toBe(false);
    }finally{rmSync(root,{recursive:true,force:true})}
  });

  test("scaffold writes unlabelled shells only",()=>{
    const root=tempRepo();
    try{
      initLabelVault(root);
      const stub=scaffoldConflictCaseStub({id:"CB-001",question:"Does butyrate raise Treg frequency?"});
      expect(stub.labels).toEqual([]);
      expect(stub.adjudicated).toBeNull();
      const written=appendConflictCaseStub(root,stub);
      expect(written.total).toBe(1);
      expect(labelVaultStatus(root).caseCounts.conflict).toBe(1);
      expect(()=>appendConflictCaseStub(root,stub)).toThrow(/already present/);
    }finally{rmSync(root,{recursive:true,force:true})}
  });

  test("freeze refuses empty labels and records digests without approval",()=>{
    const root=tempRepo();
    try{
      initLabelVault(root);
      expect(()=>freezeConflictLabels(root)).toThrow(/no labelled/);
      const cases=[{
        id:"CB-001",
        question:"q",
        provenance:"expert_curated",
        records:[{sourceId:"PMID:1",citation:"c",model:"mouse",tissue:null,population:null,design:null,negated:false}],
        labels:[{raterId:"R1",label:"context_dependent"},{raterId:"R2",label:"context_dependent"}],
        adjudicated:null,
      }];
      writeFileSync(join(root,".hsi-private-benchmark/conflict/cases.json"),`${JSON.stringify(cases,null,2)}\n`);
      const freeze=freezeConflictLabels(root,"2026-11-17T12:00:00.000Z");
      expect(freeze.scientificApproval).toBe(false);
      expect(freeze.floorsOwnerApproved).toBe(false);
      expect(freeze.caseIds).toEqual(["CB-001"]);
      expect(freeze.contentSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(existsSync(join(root,`.hsi-private-benchmark/freezes/conflict-${freeze.contentSha256.slice(0,12)}.json`))).toBe(true);
    }finally{rmSync(root,{recursive:true,force:true})}
  });

  test("refusePublicWrite blocks site and evaluation paths",()=>{
    const root=tempRepo();
    try{
      expect(()=>refusePublicWrite(join(root,"site/public/gold.json"),root)).toThrow(/public/);
      expect(()=>refusePublicWrite(join(root,"evaluation/label-vault/secret.json"),root)).toThrow(/public/);
      expect(()=>refusePublicWrite(join(root,".hsi-private-benchmark/conflict/cases.json"),root)).not.toThrow();
    }finally{rmSync(root,{recursive:true,force:true})}
  });
});
