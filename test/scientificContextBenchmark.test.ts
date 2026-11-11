import {describe,expect,test} from "bun:test";
import {runScientificContextBenchmark,type BenchmarkCase} from "../src/scientificContextBenchmark";
const sample:BenchmarkCase={
 id:"synthetic-1",pmid:"12345",sourceUrl:"https://pubmed.ncbi.nlm.nih.gov/12345/",licenceId:"test-only",
 corpus:"synthetic_fixture",
 excerpt:{sourceId:"pmid-12345",passageId:"p1",sourceVersion:"v1",locator:"abstract",passageSha256:"a".repeat(64),
 start:0,end:18,exactText:"systemic sclerosis",interpretation:"unassessed",reviewStatus:"unreviewed",
 context:{species:"unknown",tissue:null,disease:null,cohort:null,method:null,intervention:null,comparator:null,outcome:null,limitations:[]}},
 gold:[{sourceId:"pmid-12345",passageId:"p1",sourceVersion:"v1",field:"disease",start:0,end:18,exactText:"systemic sclerosis"}],
 adjudication:{reviewerA:"A",reviewerB:"B",adjudicator:"C",completedAt:"2026-11-11",status:"approved"}
};
describe("B-03.4 real-publication benchmark gate",()=>{
 test("rejects demonstration corpus",()=>expect(()=>runScientificContextBenchmark([sample])).toThrow("real publications"));
 test("rejects unreviewed corpus",()=>expect(()=>runScientificContextBenchmark([{...sample,corpus:"real_publication",adjudication:{...sample.adjudication,status:"pending"}}])).toThrow("independent"));
 test("rejects mismatched source spans",()=>expect(()=>runScientificContextBenchmark([{...sample,corpus:"real_publication",gold:[{...sample.gold[0]!,exactText:"different"}]}])).toThrow("gold span"));
 test("scores a fixture only when all structural gates are met; not evidence of scientific performance",()=>{
  const result=runScientificContextBenchmark([{...sample,corpus:"real_publication"}]);
  expect(result.metrics.f1).toBe(1);
  expect(result.annotations).toBe(1);
 });
 test("rejects absent corpus",()=>expect(()=>runScientificContextBenchmark([])).toThrow());
});
