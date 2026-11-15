import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {DIMENSION_IDS,RUBRIC_VERSION,type Score} from "../src/evaluation/rubric";
import {MIN_UNITS,analyse,blindedOutputs,exportRatings,itemsFromGaps,makeItemSet,parseItemSet,parseRatingFile,validateRatingFile,type EvalItem,type ItemSet,type Rater,type Rating,type RatingFile} from "../src/evaluation/session";
import {mulberry32} from "../src/evaluation/stats";

const item=(i:number,withBaseline:boolean):EvalItem=>({id:"i"+i,domain:"d",prompt:"Rate it",outputs:[{id:"h"+i,condition:"hsi",text:"An HSI gap statement number "+i,sourceNote:"HSI"},...(withBaseline?[{id:"b"+i,condition:"baseline" as const,text:"A comparison gap statement "+i,sourceNote:"Another tool"}]:[])]});
const mk=(n:number,baseline:boolean):ItemSet=>{const r=makeItemSet(Array.from({length:n},(_,i)=>item(i,baseline)));if(!r.ok)throw Error(r.error);return r.set};
const clampS=(x:number)=>Math.min(5,Math.max(1,Math.round(x))) as Score;
/** Seeded synthetic ratings for tests only: not data about HSI. */
function ratings(set:ItemSet,seed:number,hsiMean:number,baseMean:number):Rating[]{
 const rnd=mulberry32(seed),out:Rating[]=[];
 for(const it of set.items)for(const o of it.outputs){const m=o.condition==="hsi"?hsiMean:baseMean;const s={} as Record<string,Score>;for(const d of DIMENSION_IDS)s[d]=clampS(m+(rnd()-.5)*2.2);out.push({itemId:it.id,outputId:o.id,scores:s as never,note:"",at:"t"})}
 return out;
}
const file=(set:ItemSet,id:string,independent:boolean,rs:Rating[]):RatingFile=>({schema:"hsi-eval-ratings-1",rubric:RUBRIC_VERSION,itemsDigest:set.digest,rater:{raterId:id,independent,expertise:"domain_expert"},ratings:rs});

describe("item sets",()=>{
 test("valid sets get a digest that changes with content; bad ones are refused",()=>{
  const a=mk(3,false),b=mk(4,false);expect(a.digest).toMatch(/^[a-f0-9]{64}$/);expect(a.digest).not.toBe(b.digest);
  expect(makeItemSet([]).ok).toBe(false);expect(makeItemSet([item(1,false),item(1,false)]).ok).toBe(false);
  expect(makeItemSet([{...item(1,false),outputs:[{id:"x",condition:"hsi",text:"short",sourceNote:""}]}]).ok).toBe(false);
  expect(makeItemSet([{...item(1,false),outputs:[{id:"x",condition:"other" as never,text:"long enough text here",sourceNote:""}]}]).ok).toBe(false);
 });
 test("round-trips through JSON and refuses a tampered digest",()=>{
  const s=mk(3,true);expect(parseItemSet(JSON.stringify(s))?.digest).toBe(s.digest);
  expect(parseItemSet(JSON.stringify({...s,items:s.items.slice(1)}))).toBeNull();expect(parseItemSet("{bad")).toBeNull();expect(parseItemSet(null)).toBeNull();
 });
 test("items from the published graph gaps carry HSI outputs only and invent no comparison",()=>{
  const g=JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")),items=itemsFromGaps(g);
  expect(items).toHaveLength(g.gaps.length);for(const it of items){expect(it.outputs).toHaveLength(1);expect(it.outputs[0]!.condition).toBe("hsi")}
  expect(makeItemSet(items).ok).toBe(true);
 });
});

describe("blinding",()=>{
 const it=item(1,true);
 test("labels never reveal the condition; order is stable per rater and varies across raters",()=>{
  const a=blindedOutputs("rater-a",it);expect(a.map(x=>x.label)).toEqual(["Output 1","Output 2"]);expect(JSON.stringify(a.map(x=>x.label))).not.toMatch(/hsi|baseline/i);
  expect(blindedOutputs("rater-a",it).map(x=>x.output.id)).toEqual(a.map(x=>x.output.id));
  const firsts=new Set(Array.from({length:40},(_,i)=>blindedOutputs("rater-"+i,it)[0]!.output.condition));expect(firsts.size).toBe(2);
 });
});

describe("rating files",()=>{
 const set=mk(4,true),good=()=>file(set,"Reviewer one",true,ratings(set,1,4,3));
 test("a valid file passes; the export parses back to the same ratings",()=>{
  expect(validateRatingFile(good(),set).ok).toBe(true);
  const text=exportRatings(good().rater,set,good().ratings),r=parseRatingFile(text,set);expect(r.ok&&r.file.ratings.length).toBe(8);
 });
 test("refuses another item set, emails as ids, duplicates, unknown outputs, bad scores and oversize or bad JSON",()=>{
  const other=mk(5,true);expect(validateRatingFile(good(),other).ok).toBe(false);
  const g=good();
  expect(validateRatingFile({...g,rater:{...g.rater,raterId:"a@b.co"}},set).ok).toBe(false);
  expect(validateRatingFile({...g,rater:{...g.rater,independent:"yes"}},set).ok).toBe(false);
  expect(validateRatingFile({...g,ratings:[...g.ratings,g.ratings[0]]},set).ok).toBe(false);
  expect(validateRatingFile({...g,ratings:[{...g.ratings[0],outputId:"nope"}]},set).ok).toBe(false);
  expect(validateRatingFile({...g,ratings:[{...g.ratings[0],scores:{...g.ratings[0]!.scores,novelty:6}}]},set).ok).toBe(false);
  expect(validateRatingFile({...g,ratings:[{...g.ratings[0],itemId:"i3"}]},set).ok).toBe(false);
  expect(parseRatingFile("{bad",set).ok).toBe(false);expect(parseRatingFile("x".repeat(2_000_000),set).ok).toBe(false);
 });
});

describe("analysis refuses to overclaim",()=>{
 test("no independent raters: nothing is shown, only counts, and the reason is stated",()=>{
  const set=mk(12,true),a=analyse(set,[file(set,"owner",false,ratings(set,1,5,2))]);
  expect(a.status).toBe("insufficient");expect(a.independentRaters).toBe(0);expect(a.reasons.join(" ")).toContain("independent raters are needed");
  for(const c of ["hsi","baseline"] as const)for(const d of DIMENSION_IDS)expect(a.byCondition[c][d].ci).toBeNull();
  expect(a.notes.join(" ")).toContain("excluded from every result");
 });
 test("one independent rater is not enough, even with many ratings",()=>{
  const set=mk(20,true),a=analyse(set,[file(set,"r1",true,ratings(set,1,4,3))]);expect(a.status).toBe("insufficient");expect(a.byCondition.hsi.relevance.ci).toBeNull();
 });
 test("builders' ratings are excluded even when independent raters are present",()=>{
  const set=mk(12,false),ind=[file(set,"r1",true,ratings(set,1,3,3)),file(set,"r2",true,ratings(set,2,3,3))];
  const a=analyse(set,[...ind,file(set,"owner",false,ratings(set,3,5,5))]),b=analyse(set,ind);
  expect(a.byCondition.hsi.relevance.ci).toEqual(b.byCondition.hsi.relevance.ci);expect(a.raters).toHaveLength(3);
 });
 test("fewer than the minimum doubly-rated units shows no mean and says how many are needed",()=>{
  const set=mk(MIN_UNITS-1,false),a=analyse(set,[file(set,"r1",true,ratings(set,1,4,4)),file(set,"r2",true,ratings(set,2,4,4))]);
  expect(a.status).toBe("insufficient");expect(a.byCondition.hsi.relevance.ci).toBeNull();expect(a.reasons.join(" ")).toContain(`${MIN_UNITS} are needed`);
 });
 test("with enough independent ratings: intervals per dimension, agreement, and a clear HSI-higher reading when the data show it",()=>{
  const set=mk(24,true),fs=[file(set,"r1",true,ratings(set,1,4.2,2.6)),file(set,"r2",true,ratings(set,2,4.2,2.6)),file(set,"r3",true,ratings(set,3,4.2,2.6))];
  const a=analyse(set,fs);expect(a.status).toBe("ok");expect(a.independentRaters).toBe(3);
  for(const d of DIMENSION_IDS){
   const h=a.byCondition.hsi[d],b=a.byCondition.baseline[d];expect(h.ci!.low).toBeLessThanOrEqual(h.ci!.mean);expect(h.ci!.n).toBe(24);expect(h.ci!.mean).toBeGreaterThan(b.ci!.mean);
   expect(a.comparison[d].pairedItems).toBe(24);expect(a.comparison[d].reading).toBe("hsi_higher");expect(a.comparison[d].diff!.low).toBeGreaterThan(0);
   expect(a.agreement[d].pairs).toBe(3);
  }
  expect(a.notes.join(" ")).toContain("no overall score");expect(JSON.stringify(a)).not.toMatch(/overallScore|"total"|"best"/);
 });
 test("no real difference means 'not established', never 'baseline higher' or 'HSI higher'",()=>{
  const set=mk(24,true),a=analyse(set,[file(set,"r1",true,ratings(set,4,3.5,3.5)),file(set,"r2",true,ratings(set,5,3.5,3.5))]);
  for(const d of DIMENSION_IDS)expect(a.comparison[d].reading).toBe("not_established");
 });
 test("without comparison outputs there is no comparison at all",()=>{
  const set=mk(14,false),a=analyse(set,[file(set,"r1",true,ratings(set,1,4,4)),file(set,"r2",true,ratings(set,2,4,4))]);
  for(const d of DIMENSION_IDS){expect(a.comparison[d].diff).toBeNull();expect(a.comparison[d].pairedItems).toBe(0)}
 });
 test("analysis is deterministic",()=>{
  const set=mk(14,true),fs=[file(set,"r1",true,ratings(set,1,4,3)),file(set,"r2",true,ratings(set,2,4,3))];
  expect(JSON.stringify(analyse(set,fs))).toBe(JSON.stringify(analyse(set,fs)));
 });
});
