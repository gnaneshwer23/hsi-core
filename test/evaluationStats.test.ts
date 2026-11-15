import {describe,expect,test} from "bun:test";
import {bootstrapMeanCI,kappaLabel,mean,mulberry32,pairedDiffCI,percentAgreement,weightedKappa} from "../src/evaluation/stats";
import {DIMENSIONS,DIMENSION_IDS,isScore} from "../src/evaluation/rubric";

describe("rubric",()=>{
 test("four separate dimensions, each with anchors at 1, 3 and 5, and no combined score",()=>{
  expect(DIMENSION_IDS).toEqual(["relevance","specificity","novelty","accuracy"]);
  for(const d of DIMENSIONS){expect(d.question.endsWith("?")).toBe(true);expect(Object.keys(d.anchors)).toEqual(["1","3","5"])}
  expect([1,5,3].every(isScore)&&[0,6,2.5,"3",NaN,null].every(v=>!isScore(v))).toBe(true);
 });
});
describe("weightedKappa",()=>{
 test("identical ratings give 1; reversed ratings give a negative value; no variation is undefined",()=>{
  const a=[1,2,3,4,5,3,2,4],b=[...a];expect(weightedKappa(a,b)).toBe(1);
  expect(weightedKappa([1,5,1,5,1,5],[5,1,5,1,5,1])!).toBeLessThan(-0.8);
  expect(weightedKappa([3,3,3,3],[3,3,3,3])).toBeNull();
 });
 test("near misses cost less than far misses",()=>{
  const base=[1,2,3,4,5,1,2,3,4,5],near=base.map(x=>Math.min(5,x+1)),far=base.map(x=>6-x);
  expect(weightedKappa(base,near)!).toBeGreaterThan(weightedKappa(base,far)!);
 });
 test("rejects mismatched lengths, tiny samples and out-of-range scores",()=>{
  expect(weightedKappa([1,2],[1])).toBeNull();expect(weightedKappa([1],[1])).toBeNull();expect(weightedKappa([1,9],[1,2])).toBeNull();
 });
 test("agreement percentages and labels",()=>{
  expect(percentAgreement([1,2,3,4],[1,2,4,4])).toBe(0.75);expect(percentAgreement([1,2,3,4],[2,3,4,5],1)).toBe(1);expect(percentAgreement([],[])).toBeNull();
  expect([0.1,0.3,0.5,0.7,0.9,null].map(kappaLabel)).toEqual(["slight","fair","moderate","substantial","almost perfect","not defined"]);
 });
});
describe("bootstrap",()=>{
 test("is deterministic for a seed and brackets the mean; needs at least two units",()=>{
  const xs=[2,3,3,4,4,4,5,5,3,4],a=bootstrapMeanCI(xs,5)!,b=bootstrapMeanCI(xs,5)!;
  expect(a).toEqual(b);expect(a.low).toBeLessThanOrEqual(a.mean);expect(a.high).toBeGreaterThanOrEqual(a.mean);expect(a.mean).toBe(mean(xs)!);
  expect(bootstrapMeanCI([4],5)).toBeNull();expect(bootstrapMeanCI([],5)).toBeNull();
 });
 test("more data gives a narrower interval; a constant sample has a zero-width interval",()=>{
  const rnd=mulberry32(3),small=Array.from({length:10},()=>1+Math.floor(rnd()*5)),big=Array.from({length:400},()=>1+Math.floor(rnd()*5));
  const s=bootstrapMeanCI(small)!,l=bootstrapMeanCI(big)!;expect(l.high-l.low).toBeLessThan(s.high-s.low);
  const c=bootstrapMeanCI([4,4,4,4,4])!;expect(c.low).toBe(4);expect(c.high).toBe(4);
 });
 test("paired differences: a consistent gap excludes zero; no gap includes it; length mismatch is null",()=>{
  const b=[2,3,3,2,3,2,3,3,2,3],a=b.map(x=>x+1);const d=pairedDiffCI(a,b)!;expect(d.low).toBeGreaterThan(0);
  const e=pairedDiffCI([3,2,4,3,2,4,3,2],[2,3,3,4,3,2,3,4])!;expect(e.low).toBeLessThanOrEqual(0);expect(e.high).toBeGreaterThanOrEqual(0);
  expect(pairedDiffCI([1,2],[1])).toBeNull();
 });
});
