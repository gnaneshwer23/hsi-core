/**
 * Extracts a compact term table (identifier, label, synonyms, parents, obsolete flag) from an OBO-format or OBO-JSON
 * ontology file. Nothing is interpreted: this keeps what the ontology says and drops the rest. It does not map
 * anything to HSI concepts and does not judge scientific validity.
 */
export type OntologyTerm={id:string;label:string;synonyms:string[];parents:string[];obsolete:boolean};
export type ExtractedOntology={idPrefix:string;terms:OntologyTerm[];dataVersion:string|null};

const iri=(s:string)=>{const m=/\/obo\/([A-Za-z]+)_(\d+)$/.exec(s);return m?`${m[1]}:${m[2]}`:s};

/** OBO flat format (.obo). Only [Term] stanzas whose id starts with `idPrefix:` are kept. */
export function parseOboFlat(text:string,idPrefix:string):ExtractedOntology{
 const terms:OntologyTerm[]=[];let dataVersion:string|null=null,cur:OntologyTerm|null=null,inTerm=false;
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim();
  if(line==="[Term]"){if(cur&&cur.id.startsWith(idPrefix+":"))terms.push(cur);cur={id:"",label:"",synonyms:[],parents:[],obsolete:false};inTerm=true;continue}
  if(line.startsWith("[")){if(cur&&cur.id.startsWith(idPrefix+":"))terms.push(cur);cur=null;inTerm=false;continue}
  if(!inTerm){const m=/^data-version:\s*(.+)$/.exec(line);if(m)dataVersion=m[1]!.trim();continue}
  if(!cur||!line)continue;
  const i=line.indexOf(": ");if(i<0)continue;const k=line.slice(0,i),v=line.slice(i+2);
  if(k==="id")cur.id=v.trim();
  else if(k==="name")cur.label=v.trim();
  else if(k==="is_obsolete")cur.obsolete=v.trim()==="true";
  else if(k==="synonym"){const m=/^"((?:[^"\\]|\\.)*)"\s+(EXACT|RELATED|NARROW|BROAD)\b/.exec(v);if(m&&m[2]==="EXACT")cur.synonyms.push(m[1]!.replace(/\\(.)/g,"$1"))}
  else if(k==="is_a"){const p=v.split(/\s+/)[0]!;if(p.startsWith(idPrefix+":"))cur.parents.push(p)}
 }
 if(cur&&cur.id.startsWith(idPrefix+":"))terms.push(cur);
 return {idPrefix,terms:terms.filter(t=>t.id&&t.label||t.obsolete),dataVersion};
}

type JsonNode={id:string;lbl?:string;type?:string;meta?:{deprecated?:boolean;synonyms?:{pred?:string;val?:string}[];version?:string;basicPropertyValues?:{pred?:string;val?:string}[]}};
type JsonEdge={sub:string;pred:string;obj:string};
/** OBO Graphs JSON (.json). Keeps class nodes under `idPrefix` and exact synonyms; `is_a` edges become parents. */
export function parseOboJson(text:string,idPrefix:string):ExtractedOntology{
 const doc=JSON.parse(text) as {graphs?:{nodes?:JsonNode[];edges?:JsonEdge[];meta?:{version?:string}}[]};
 const graph=doc.graphs?.[0];if(!graph)throw Error("Not an OBO Graphs file");
 const byId=new Map<string,OntologyTerm>();
 for(const n of graph.nodes??[]){
  if(n.type!=="CLASS")continue;const id=iri(n.id);if(!id.startsWith(idPrefix+":"))continue;
  byId.set(id,{id,label:n.lbl??"",synonyms:(n.meta?.synonyms??[]).filter(s=>s.pred==="hasExactSynonym"&&s.val).map(s=>s.val!),parents:[],obsolete:n.meta?.deprecated===true});
 }
 for(const e of graph.edges??[]){
  if(e.pred!=="is_a")continue;const child=byId.get(iri(e.sub)),parent=iri(e.obj);
  if(child&&parent.startsWith(idPrefix+":"))child.parents.push(parent);
 }
 return {idPrefix,terms:[...byId.values()].filter(t=>t.label||t.obsolete),dataVersion:graph.meta?.version??null};
}
export const parseOntology=(format:"obo"|"obo-json",text:string,idPrefix:string)=>format==="obo"?parseOboFlat(text,idPrefix):parseOboJson(text,idPrefix);
