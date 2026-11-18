import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";

describe("hsi brand tokens v1",()=>{
 test("Stage-1 tokens keep formal name and forbid Human Systems Intelligence",()=>{
  const path=join(import.meta.dir,"../docs/design/hsi-brand-tokens.v1.json");
  const tokens=JSON.parse(readFileSync(path,"utf8")) as {
   schemaVersion:string;
   formalName:string;
   descriptor:string;
   productionWired:boolean;
   forbiddenExpansions:string[];
   palette:Record<string,{hex:string}>;
   domainsPresentation:string[];
  };
  expect(tokens.schemaVersion).toBe("hsi-brand-tokens-1");
  expect(tokens.formalName).toBe("Human Super Intelligence");
  expect(tokens.descriptor).toBe("Scientific Intelligence for Human Biology");
  expect(tokens.productionWired).toBe(false);
  expect(tokens.forbiddenExpansions).toContain("Human Systems Intelligence");
  expect(tokens.palette.midnight.hex).toBe("#0B1720");
  expect(tokens.palette.signalMint.hex).toBe("#58C6B6");
  expect(tokens.palette.coral.hex).toBe("#E47B72");
  expect(tokens.domainsPresentation).toHaveLength(6);
 });

 test("redesign doctrine exists and states non-negotiables",()=>{
  const doc=readFileSync(join(import.meta.dir,"../docs/design/HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md"),"utf8");
  expect(doc).toContain("Human Super Intelligence");
  expect(doc).toContain("Scientific Intelligence for Human Biology");
  expect(doc).toContain("Do **not** rename repositories");
  expect(doc).toContain("Lovable");
  expect(doc).toContain("Do **not** adopt yet");
  expect(doc).toContain("legally unverified expansion");
  expect(doc).toContain("PRIMARY_NAV_LINKS");
  expect(doc).toContain("No production `/validation` route");
  expect(doc).toContain("not** in primary header nav");
 });

 test("definitive product vision freeze is present",()=>{
  const vision=readFileSync(join(import.meta.dir,"../docs/strategy/HSI_DEFINITIVE_PRODUCT_VISION.md"),"utf8");
  expect(vision).toContain("Building the intelligence layer for understanding human biology");
  expect(vision).toContain("Context-aware scientific evidence and mechanism intelligence");
  expect(vision).toContain("HSI 1.0");
  expect(vision).toContain("Inform the next decision");
  const wrapper=readFileSync(join(import.meta.dir,"../docs/strategy/HSI_VISION.md"),"utf8");
  expect(wrapper).toContain("HSI_DEFINITIVE_PRODUCT_VISION.md");
 });
});

