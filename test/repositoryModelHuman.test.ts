import {describe,expect,test} from "bun:test";
import {repositoryModel} from "../src/knowledgeGraph/buildDomainGraph";

describe("study system from the stated design",()=>{
 test("designs that state human participants are human in vivo",()=>{
  for(const d of ["Human observational cohort","human case-control","Meta-analysis of human studies"])expect(repositoryModel("X-1",d)).toBe("human_in_vivo");
 });
 test("ambiguous or non-participant designs stay unspecified rather than guessed",()=>{
  for(const d of ["human SSc skin","Narrative review","P1.3 competing Th17 frame"])expect(repositoryModel("X-1",d)).toBe("unspecified");
 });
 test("a mouse mention still wins over a human one, and disclaimers do not make a human study",()=>{
  expect(repositoryModel("X-1","Human cohort and mouse knockout")).toBe("mixed");
  expect(repositoryModel("X-1","mouse model; human relevance not shown")).toBe("mouse");
 });
});
