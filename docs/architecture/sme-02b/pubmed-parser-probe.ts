// Isolated dependency evaluation; not a production runtime adapter.
import {SaxesParser} from "saxes";
import {projectPubmedXml,type PubmedXmlNode,type PubmedXmlParser} from "../../../src/scientificMemoryPubmedXml";
const parser:PubmedXmlParser={parse(xml,options){
 const stack:PubmedXmlNode[]=[];let root:PubmedXmlNode|undefined;let count=0;
 const p=new SaxesParser({xmlns:false});
 p.on("error",e=>{throw e;});
 p.on("doctype",d=>{if(!/^\s*PubmedArticleSet\s+PUBLIC\s+["'][^"']+["']\s+["']https:\/\/dtd\.nlm\.nih\.gov\/ncbi\/pubmed\/out\/pubmed_[0-9]+\.dtd["']\s*$/.test(d))throw Error("Unapproved DOCTYPE");});
 p.on("opentag",tag=>{
 if(++count>options.maxNodes||stack.length>=options.maxDepth||tag.name.includes(":")||Object.keys(tag.attributes).some(k=>k==="xmlns"||k.includes(":")))throw Error("XML bounds or namespace");
 const node:PubmedXmlNode={name:tag.name,text:"",attributes:tag.attributes,children:[]};
 const parent=stack[stack.length-1];if(parent)(parent.children as PubmedXmlNode[]).push(node);else{if(root)throw Error("Multiple roots");root=node;}stack.push(node);
 });
 const append=(s:string)=>{const node=stack[stack.length-1];if(node)node.text+=s;};
 p.on("text",append);p.on("cdata",append);p.on("closetag",()=>{stack.pop();});
 p.write(xml).close();if(!root||stack.length)throw Error("Incomplete XML");return root;
}};
const good='<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>123</PMID><CommentsCorrectionsList><CommentsCorrections RefType="RetractionIn"><PMID>456</PMID></CommentsCorrections></CommentsCorrectionsList></MedlineCitation></PubmedArticle></PubmedArticleSet>';
if(projectPubmedXml("123",good,parser).status.status!=="retracted")throw Error("Projection failed");
for(const bad of [good.replace("<PMID>123","<PMID>999"),good.slice(0,-10),good.replace("<PMID>123","<PMID a='1' a='2'>123"),'<!DOCTYPE x [<!ENTITY x SYSTEM "file:///etc/passwd">]>'+good,good.replace("123","&unknown;"),good.replace("<PMID>123","<PMID>"+ "<x>".repeat(65)+"123"+"</x>".repeat(65))]){
 let rejected=false;try{projectPubmedXml("123",bad,parser);}catch{rejected=true;}if(!rejected)throw Error("Adversarial input accepted");
}
console.log("Isolated XML parser fixture passed");
