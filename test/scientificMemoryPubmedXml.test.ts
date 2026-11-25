import {test,expect} from "bun:test";
import {projectPubmedXml,type PubmedXmlNode} from "../src/scientificMemoryPubmedXml";
const n=(name:string,text="",children:PubmedXmlNode[]=[],attributes:Record<string,string>={}):PubmedXmlNode=>({name,text,children,attributes});
const tree=n("PubmedArticleSet","",[n("PubmedArticle","",[n("MedlineCitation","",[n("PMID","123"),n("CommentsCorrectionsList","",[n("CommentsCorrections","",[n("PMID","456")],{RefType:"RetractionIn"})])]),n("PubmedData","",[n("ArticleIdList","",[n("ArticleId","10.1234/example",[],{IdType:"doi"}),n("ArticleId","PMC123",[],{IdType:"pmc"})])])])]);
test("projects identity and notice using restricted parser options",()=>{
 const r=projectPubmedXml("123","<fixture/>",{parse(_,options){expect(options.externalEntities).toBe(false);expect(options.resolveDtd).toBe(false);return tree;}});
 expect(r.status.status).toBe("retracted");expect(r.doi).toBe("10.1234/example");expect(r.pmcid).toBe("PMC123");expect(r.ingestionAllowed).toBe(false);
});
test("rejects unsafe declarations before parser invocation",()=>{
 for(const xml of ['<!DOCTYPE x [<!ENTITY x SYSTEM "file:///etc/passwd">]><x/>','<!ENTITY x "value">'])expect(()=>projectPubmedXml("123",xml,{parse(){throw Error("Parser called");}})).toThrow("Unsafe XML");
});
test("rejects mismatched identity and multiple records",()=>{
 expect(()=>projectPubmedXml("999","<fixture/>",{parse:()=>tree})).toThrow("PMID mismatch");
 expect(()=>projectPubmedXml("123","<fixture/>",{parse:()=>({...tree,children:[...tree.children,...tree.children]})})).toThrow();
});
