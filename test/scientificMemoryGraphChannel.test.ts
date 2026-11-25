import {test,expect} from "bun:test";
import {createMemoryGraphChannel} from "../src/scientificMemoryGraphChannel";
import type {createMemoryGraphRetriever} from "../src/scientificMemoryGraphRetrieval";
const id="00000000-0000-4000-8000-000000000001";
const token="synthetic-token-alice";
type Retriever=Awaited<ReturnType<typeof createMemoryGraphRetriever>>;
const retriever:Retriever={graphVersion:"a".repeat(64),rank(_terms,links){return links.map((l,i)=>({id:l.id,version:l.version,graphRank:i+1,graphVersion:"a".repeat(64),matchedNodeIds:[...l.nodeIds],edgeIds:[],scientificClaimAllowed:false}));}};
test("passes only authorized repository rows to ranking",async()=>{
 const channel=createMemoryGraphChannel({async unsafe(q,p){expect(q).toContain("read_graph_links");expect(p).toEqual([token,"a","s","a".repeat(64),"{"+id+"}"]);return [{record_id:id,version:2,node_id:"entity:a"}];}},retriever);
 expect((await channel.search(token,"a","s",["entity"],[id]))[0]?.version).toBe(2);
});
test("denied or missing links never enter ranking",async()=>{
 const channel=createMemoryGraphChannel({async unsafe(){return [];}},retriever);
 expect(await channel.search(token,"a","s",["entity"],[id])).toEqual([]);
});
test("unexpected IDs and mixed versions fail closed",async()=>{
 for(const rows of [[{record_id:"unexpected",version:1,node_id:"a"}],[{record_id:id,version:1,node_id:"a"},{record_id:id,version:2,node_id:"b"}]]){
 const channel=createMemoryGraphChannel({async unsafe(){return rows;}},retriever);
 await expect(channel.search(token,"a","s",["entity"],[id])).rejects.toThrow("Graph retrieval unavailable");
 }
});
