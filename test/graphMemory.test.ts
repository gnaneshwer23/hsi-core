import {expect,test} from "bun:test";
import {MEMORY_STORAGE_KEY,browserMemory,claimsApproval,isStale,latestOutputs,readMemory,type MemoryStorage} from "../src/graphWorkspace/memory";

const mem=():MemoryStorage&{data:Map<string,string>}=>{const data=new Map<string,string>();return{data,getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,v)}}};
const GV="b".repeat(64);
let n=0;const ids=()=>`00000000-0000-4000-8000-${String(++n).padStart(12,"0")}`;

test("a saved investigation has the one-store shape: created and selection events, then immutable sections",()=>{
 const s=mem(),m=browserMemory(s,ids);
 const i=m.create({question:"Does butyrate expand colonic Tregs?",entities:["butyrate","treg","butyrate"],edgeIds:["e1"],graphVersion:GV,record:{answers:[]}});
 expect(i.where).toBe("browser");expect(i.entities).toEqual(["butyrate","treg"]);
 expect(i.events.map(e=>e.kind)).toEqual(["created","selection","output"]);
 m.addOutput(i.id,"01",{answers:[1]},{graphVersion:GV});
 const got=m.get(i.id)!;
 expect(got.outputs.map(o=>o.version)).toEqual([1,2]);expect(latestOutputs(got)[0]!.version).toBe(2);
 expect(got.events.map(e=>e.seq)).toEqual([1,2,3,4]);
});
test("approval is refused on create and on outputs, and a stored approval claim is dropped on read",()=>{
 const s=mem(),m=browserMemory(s,ids);
 expect(()=>m.create({question:"Is this approved now?",entities:[],edgeIds:[],graphVersion:GV,record:{x:{scientificApproval:true}}})).toThrow("approval");
 const i=m.create({question:"A fair question here",entities:[],edgeIds:[],graphVersion:GV});
 expect(()=>m.addOutput(i.id,"02",{scientificClaimAllowed:true},{})).toThrow("approval");
 const raw=JSON.parse(s.data.get(MEMORY_STORAGE_KEY)!);raw.investigations[0].outputs=[{section:"01",version:1,body:{scientificApproval:true},lineage:{},at:""}];
 s.setItem(MEMORY_STORAGE_KEY,JSON.stringify(raw));
 const r=readMemory(s);expect(r.file.investigations).toHaveLength(0);expect(r.dropped).toBe(1);
 expect(claimsApproval({a:[{b:{scientificApproval:false}}]})).toBe(false);
});
test("bad input is refused, damaged storage reads as empty, and an old graph version is flagged",()=>{
 const s=mem(),m=browserMemory(s,ids);
 expect(()=>m.create({question:"no",entities:[],edgeIds:[],graphVersion:GV})).toThrow("5 to 2000");
 expect(()=>m.create({question:"A fair question here",entities:[],edgeIds:[],graphVersion:"latest"})).toThrow("pinned");
 expect(()=>m.note("missing","x")).toThrow("not found");
 s.setItem(MEMORY_STORAGE_KEY,"{not json");expect(readMemory(s).file.investigations).toEqual([]);
 const i=m.create({question:"A fair question here",entities:[],edgeIds:[],graphVersion:GV});
 expect(isStale(i,GV)).toBe(false);expect(isStale(i,"c".repeat(64))).toBe(true);
 m.setStatus(i.id,"archived");expect(m.get(i.id)!.events.at(-1)!.kind).toBe("status");
 expect(readMemory(null).file.investigations).toEqual([]);
});
