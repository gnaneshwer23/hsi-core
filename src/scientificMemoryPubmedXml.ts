import {normalizePmid,interpretPubmedStatus} from "./scientificMemoryPubmed";
import {normalizeEvidenceDoi} from "./scientificMemoryCrossref";
export interface PubmedXmlNode {name:string;text:string;attributes:Readonly<Record<string,string>>;children:readonly PubmedXmlNode[]}
export interface PubmedXmlParser {parse(xml:string,options:{externalEntities:false;resolveDtd:false;maxDepth:number;maxNodes:number}):PubmedXmlNode}
/** Parser adapter is trusted and must enforce options; no production parser is registered. */
export function projectPubmedXml(requested:string,xml:string,parser:PubmedXmlParser){
 const pmid=normalizePmid(requested);
 if(typeof xml!=="string"||new TextEncoder().encode(xml).length>2097152||/<!ENTITY\b/i.test(xml)||/<!DOCTYPE[^>]*\[/i.test(xml))throw Error("Unsafe XML");
 const root=parser.parse(xml,{externalEntities:false,resolveDtd:false,maxDepth:64,maxNodes:50000});
 let count=0;
 function validate(n:PubmedXmlNode,depth:number){if(depth>64||++count>50000||!n||typeof n.name!=="string"||typeof n.text!=="string"||!Array.isArray(n.children)||!n.attributes)throw Error("Invalid XML tree");for(const c of n.children)validate(c,depth+1);}
 validate(root,0);
 const children=(n:PubmedXmlNode,name:string)=>n.children.filter(c=>c.name===name);
 function one(n:PubmedXmlNode,name:string){const matches=children(n,name);if(matches.length!==1)throw Error("Ambiguous XML identity");return matches[0];}
 if(root.name!=="PubmedArticleSet"||root.children.length!==1)throw Error("Unexpected PubMed record count");
 const article=one(root,"PubmedArticle"),citation=one(article,"MedlineCitation");
 if(normalizePmid(one(citation,"PMID").text.trim())!==pmid)throw Error("PMID mismatch");
 const links=children(citation,"CommentsCorrectionsList").flatMap(n=>children(n,"CommentsCorrections")).map(n=>{
 const ids=children(n,"PMID");if(ids.length>1)throw Error("Ambiguous notice PMID");
 return {refType:n.attributes.RefType,pmid:ids.length?normalizePmid(ids[0].text.trim()):undefined};
 });
 const ids=children(article,"PubmedData").flatMap(n=>children(n,"ArticleIdList")).flatMap(n=>children(n,"ArticleId"));
 const dois=[...new Set(ids.filter(n=>n.attributes.IdType==="doi").map(n=>normalizeEvidenceDoi(n.text.trim())))];
 const pmcids=[...new Set(ids.filter(n=>n.attributes.IdType==="pmc").map(n=>n.text.trim()))];
 if(dois.length>1||pmcids.length>1||pmcids.some(id=>!/^PMC[1-9][0-9]*$/.test(id)))throw Error("Ambiguous publication identifiers");
 return {status:interpretPubmedStatus(pmid,{pmid,commentsCorrections:links}),doi:dois[0]??null,pmcid:pmcids[0]??null,ingestionAllowed:false as const};
}
