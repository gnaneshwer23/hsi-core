import {expect,it} from "bun:test";
import {buildDomainInvestigation} from "../src/evidence/crossDomainInvestigation";
it("does not advertise verified coverage with no evidence",()=>{
 expect(()=>buildDomainInvestigation({domain:"neurobiology",question:"Neuroimmune signalling",
 edges:[],capability:"available_verified",researchGap:null})).toThrow();
});
it("supports all four domains without inventing evidence",()=>{
 for(const domain of ["immunity","microbiome","neurobiology","metabolism"] as const){
  const x=buildDomainInvestigation({domain,question:"What is the mechanism?",
   edges:[],capability:"in_development",researchGap:"Evidence extraction pending"});
  expect(x.domain).toBe(domain);expect(x.scientificConclusion).toBe(false);
 }
});
