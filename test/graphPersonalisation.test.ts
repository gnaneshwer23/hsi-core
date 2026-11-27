import {describe,expect,it} from "bun:test";
import {DEFAULT_OPENING,WORKSPACE_SCOPES,isOpenable,modeById,openingView,type PersonalisationInput} from "../src/graphWorkspace";

const base:PersonalisationInput={persona:null,objectives:[],primaryDomain:null,secondaryDomains:[],level:null};

describe("opening view",()=>{
 it("with no answers opens the default view and says nothing about personalisation",()=>{
  const v=openingView(base);
  expect(v).toMatchObject({mode:DEFAULT_OPENING.mode,scopeId:DEFAULT_OPENING.scopeId,personalised:false,guidance:false});
  expect(v.reasons).toEqual([]);
 });
 it("a conflict goal wins over every other goal, so conflicts are never pushed aside",()=>{
  expect(openingView({...base,objectives:["learn","hypotheses","conflicts"]}).mode).toBe("contradiction");
 });
 it("maps goals to modes in a stated order, and falls back to the role",()=>{
  expect(openingView({...base,objectives:["hypotheses","gaps"]}).mode).toBe("hypothesis");
  expect(openingView({...base,objectives:["plan"]}).mode).toBe("experimental");
  expect(openingView({...base,objectives:["review"]}).mode).toBe("evidence");
  expect(openingView({...base,persona:"student"}).mode).toBe("atlas");
  expect(openingView({...base,persona:"clinical"}).mode).toBe(DEFAULT_OPENING.mode);
 });
 it("only ever opens a mode that can be opened",()=>{
  const goals=["conflicts","hypotheses","plan","methods","gaps","review","learn","mechanisms","targets","translation","coordinate","collaborators"];
  const personas=["student","researcher","professor","laboratory","computational","clinical","biotech","institution",null] as const;
  for(const g of goals)for(const p of personas)expect(isOpenable(modeById[openingView({...base,persona:p,objectives:[g]}).mode])).toBe(true);
 });
 it("scopes to the primary and secondary domains when a two-domain view exists",()=>{
  expect(openingView({...base,primaryDomain:"neuroscience",secondaryDomains:["microbiome"]}).scopeId).toBe("mic-neu");
  expect(openingView({...base,primaryDomain:"immunology",secondaryDomains:["neuroscience"]}).scopeId).toBe("imm-neu");
  expect(openingView({...base,primaryDomain:"microbiome"}).scopeId).toBe("imm-mic");
 });
 it("opens the whole graph, and says why, when no two-domain view covers the primary domain",()=>{
  const v=openingView({...base,primaryDomain:"genomics"});
  expect(v.scopeId).toBe("all");
  expect(v.reasons.join(" ")).toContain("no two-domain view for your primary domain yet");
 });
 it("every scope it chooses exists",()=>{
  for(const d of ["immunology","neuroscience","microbiome","genomics","organ","disease"] as const)
   expect(WORKSPACE_SCOPES.some(s=>s.id===openingView({...base,primaryDomain:d}).scopeId)).toBe(true);
 });
 it("gives a reason for every choice and says nothing is hidden",()=>{
  const v=openingView({...base,persona:"student",objectives:["conflicts"],primaryDomain:"immunology",level:"foundations"});
  expect(v.guidance).toBe(true);
  expect(v.reasons.length).toBe(4);
  expect(v.reasons.at(-1)).toContain("No relationship is hidden, and every mode, including conflicts, stays one click away.");
 });
 it("never returns filters: personalisation chooses where to open, not what to show",()=>{
  const v=openingView({...base,objectives:["conflicts"],primaryDomain:"immunology"}) as Record<string,unknown>;
  expect(Object.keys(v).sort()).toEqual(["guidance","mode","personalised","reasons","scopeId"]);
 });
});
