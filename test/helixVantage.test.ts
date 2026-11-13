import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {runFixtureInvestigation} from "../src/investigationRunner";
import {createHelix,type MechanismRequest} from "../src/helixMechanism";
import {proposeGaps} from "../src/vantageGaps";

const fx=JSON.parse(readFileSync(new URL("../research/runner-fixtures/gut-immune-metabolic-crossdomain.v1.json",import.meta.url),"utf8"));
const audit=async()=>(await runFixtureInvestigation({fixture:fx})).audit;

test("HELIX is refused unless explicitly enabled with a runner",async()=>{
 const a=await audit();
 await expect(createHelix({enabled:false,runner:async()=>({})}).propose(a)).rejects.toThrow("disabled");
 await expect(createHelix({enabled:true}).propose(a)).rejects.toThrow("disabled");
});
test("the model is given only unit data, and valid hedged candidates become unvalidated hypotheses",async()=>{
 const a=await audit();let seen:MechanismRequest|null=null;const id=a.units[0]!.id;
 const h=createHelix({enabled:true,runner:async r=>{seen=r;return {candidates:[{statement:"Gut microbial metabolites may modulate immune signalling through a shared receptor pathway.",citedUnitIds:[id],kind:"hypothesised_mechanism"}]}}});
 const r=await h.propose(a);
 expect(JSON.stringify(seen)).not.toContain("passageText");expect(seen!.units.length).toBe(a.units.length);
 expect(r.candidates).toHaveLength(1);expect(r.candidates[0]).toMatchObject({status:"unvalidated_hypothesis",approved:false,graphPromotable:false});expect(r.notice).toContain("Not evidence");
});
test("uncited, foreign-cited, unhedged-causal and malformed candidates are rejected, not repaired",async()=>{
 const a=await audit();const id=a.units[0]!.id;
 const out={candidates:[
  {statement:"Metabolites may influence immune signalling here.",citedUnitIds:[],kind:"association_summary"},
  {statement:"Metabolites may influence immune signalling here.",citedUnitIds:["not-given"],kind:"association_summary"},
  {statement:"Gut metabolites cause immune activation in the colon.",citedUnitIds:[id],kind:"association_summary"},
  {statement:"Gut metabolites could drive immune activation in the colon.",citedUnitIds:[id],kind:"hypothesised_mechanism"},
  {statement:"Gut metabolites bind receptor X in the colon.",citedUnitIds:[id],kind:"hypothesised_mechanism"},
  {statement:"short",citedUnitIds:[id]},
 ]};
 const r=await createHelix({enabled:true,runner:async()=>out}).propose(a);
 expect(r.candidates.map(c=>c.statement)).toEqual(["Gut metabolites could drive immune activation in the colon."]);
 expect(r.rejections.map(x=>x.reason)).toEqual(["no cited evidence unit","cites evidence it was not given","unhedged causal claim from association evidence","a mechanism must be worded as a hypothesis","statement missing or out of bounds"]);
});
test("garbage output yields no candidates, and the call budget is enforced",async()=>{
 const a=await audit();const h=createHelix({enabled:true,runner:async()=>"nonsense",maxCalls:1});
 expect((await h.propose(a)).candidates).toEqual([]);await expect(h.propose(a)).rejects.toThrow("budget");
});
test("VANTAGE lists unreported context as gaps and phrases unvalidated falsifiable follow-ups",async()=>{
 const a=await audit(),v=proposeGaps(a);
 expect(v.gaps.length).toBeGreaterThan(0);expect(v.followUps.length).toBe(a.report.filter(r=>r.classification!=="consistent").length);expect(v.gaps.every(g=>a.units.some(u=>u.id===g.unitId))).toBe(true);
 for(const f of v.followUps){expect(f.status).toBe("unvalidated_proposal");expect(f.approved).toBe(false);expect(f.wouldFalsify).toContain("If");}
 expect(v.notice).toContain("unvalidated");
});
