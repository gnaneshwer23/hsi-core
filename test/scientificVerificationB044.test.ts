import {describe,it,expect} from "bun:test";
import {buildCandidateGraph} from "../src/researchV2/contextualGraph";
import {verifyCandidateGraph,verifyCandidateRelationship} from "../src/researchV2/scientificVerification";
import type {PublicSourceRecord} from "../src/researchV2/sourceAdapters";
const record:PublicSourceRecord={sourceId:"opentargets:EFO_1:ENSG1",kind:"target_disease",canonicalId:"ENSG1",sourceUrl:"https://platform.opentargets.org/disease/EFO_1",retrievedAt:"2026-11-11T00:00:00Z",sourceVersion:"open-targets-graphql-v4",licenceId:null,passageUsePermitted:false,accessClass:"public",metadata:{diseaseId:"EFO_1",diseaseName:"Example disease",targetSymbol:"TARGET",associationScore:0.5,associationNotCausality:true}};
describe("B-04.4 scientific verification boundaries",()=>{
 it("checks association metadata but never claims scientific truth or approves publication",()=>{
  const graph=buildCandidateGraph([record]);const [receipt]=verifyCandidateGraph(graph);
  expect(receipt?.disposition).toBe("candidate_checked");
  expect(receipt?.checks.passageGrounding).toBe(false);
  expect(receipt?.autoPublish).toBe(false);
  expect(receipt?.scientificTruthEstablished).toBe(false);
  expect(receipt?.findings.some(f=>f.code==="missing_passage")).toBe(true);
 });
 it("escalates an unsupported causal predicate",()=>{
  const graph=buildCandidateGraph([record]);graph.edges[0]!.predicate="causes";
  const result=verifyCandidateRelationship(graph,graph.edges[0]!);
  expect(result.disposition).toBe("exception_review");
  expect(result.findings.some(f=>f.code==="unreviewed_causality")).toBe(true);
 });
 it("escalates source tampering and prevents cross-graph verification",()=>{
  const graph=buildCandidateGraph([record]);graph.edges[0]!.sourceRefs=["opentargets:missing"];
  expect(verifyCandidateGraph(graph)[0]?.disposition).toBe("exception_review");
  const other=buildCandidateGraph([record]);
  expect(()=>verifyCandidateRelationship(graph,other.edges[0]!)).toThrow();
 });
 it("rejects a graph with promotable state",()=>{
  const graph=buildCandidateGraph([record]);(graph as any).graphPromotable=true;
  expect(()=>verifyCandidateGraph(graph)).toThrow();
 });
});
