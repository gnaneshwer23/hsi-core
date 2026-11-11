import {describe,it,expect} from "bun:test";
import {retrievePubmedBibliography} from "../src/scientificPubmedRetrieval";
describe("read-only PubMed discovery",()=>{
 it("retrieves and preserves source metadata without generating scientific claims",async()=>{
  const requests:string[]=[];
  const fetcher=(async(url:string)=>{requests.push(url);return new Response(JSON.stringify(requests.length===1?{esearchresult:{count:"1",idlist:["12345"]}}:{result:{"12345":{title:"A research publication",authors:[{name:"Researcher A"}],fulljournalname:"Test Journal",pubdate:"2025"}}}),{status:200});}) as typeof fetch;
  const result=await retrievePubmedBibliography("systemic sclerosis IL-21",fetcher);
  expect(result.status).toBe("retrieved");
  expect(result.hits[0]?.url).toBe("https://pubmed.ncbi.nlm.nih.gov/12345/");
  expect(result.hits[0]?.title).toBe("A research publication");
  expect(result.disclaimer).toContain("not verified scientific claims");
  expect(requests.length).toBe(2);
 });
 it("returns an explicit empty result",async()=>{
  const fetcher=(async()=>new Response(JSON.stringify({esearchresult:{count:"0",idlist:[]}}))) as typeof fetch;
  expect((await retrievePubmedBibliography("systemic sclerosis",fetcher)).status).toBe("no_results");
 });
 it("fails closed on invalid input and upstream errors",async()=>{
  await expect(retrievePubmedBibliography("<script>")).rejects.toThrow();
  const fail=(async()=>new Response("unavailable",{status:503})) as typeof fetch;
  await expect(retrievePubmedBibliography("systemic sclerosis",fail)).rejects.toThrow("503");
 });
});
