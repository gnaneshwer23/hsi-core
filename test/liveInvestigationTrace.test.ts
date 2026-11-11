import {describe,it,expect} from "bun:test";
import {createLiveInvestigationTrace} from "../src/liveInvestigationTrace";
import {parseResearchBundle,researchRunState} from "../src/researchContracts";
describe("A-01 live investigation trace",()=>{
 it("normalizes arbitrary question and real-source bibliography into shared contract without inventing claims",async()=>{
  let n=0;const fetcher=(async()=>new Response(JSON.stringify(++n===1?{esearchresult:{count:"1",idlist:["12345"]}}:{result:{"12345":{title:"A study of neural plasticity",authors:[{name:"A Researcher"}],fulljournalname:"Journal",pubdate:"2026"}}}))) as unknown as typeof fetch;
  const result=await createLiveInvestigationTrace("How does neural plasticity respond to exercise?",fetcher);
  expect(result.bundle.context.question).toBe("How does neural plasticity respond to exercise?");
  expect(result.bundle.sources[0]?.pmid).toBe("12345");
  expect(result.bundle.sources[0]?.licence.passageUsePermitted).toBe(false);
  expect(result.bundle.passages).toEqual([]);
  expect(result.bundle.claims).toEqual([]);
  expect(result.bundle.kgWrite).toBe(false);
  expect(result.bundle.containsPhi).toBe(false);
  expect(result.bundle.runs[0]?.history.map(e=>e.stage)).toEqual(["context","context","retrieval","retrieval"]);
  expect(researchRunState(result.bundle.runs[0]!)).toBe("running");
  expect(parseResearchBundle(result.bundle)).toEqual(result.bundle);
  expect(result.persistence).toBe("not_persisted");
 });
 it("represents no results without creating claims",async()=>{
  const fetcher=(async()=>new Response(JSON.stringify({esearchresult:{count:"0",idlist:[]}}))) as unknown as typeof fetch;
  const result=await createLiveInvestigationTrace("Unusual biological research question",fetcher);
  expect(result.status).toBe("no_results");
  expect(result.bundle.sources).toEqual([]);
 });
 it("fails closed on invalid question or upstream errors",async()=>{
  await expect(createLiveInvestigationTrace("<script>")).rejects.toThrow();
  const fetcher=(async()=>new Response("down",{status:503})) as unknown as typeof fetch;
  await expect(createLiveInvestigationTrace("Any valid research question",fetcher)).rejects.toThrow("503");
 });
});
