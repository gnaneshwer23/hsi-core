/**
 * Pattern-based extraction of a few method parameters from methods-section text, each with the quoted sentence it came from.
 * No model. Accuracy is NOT measured: patterns miss things and can mis-read units or agents, so every value is unvalidated and the
 * quote is the evidence. A comparison highlights where papers report different values; it does not say which is better.
 */
export type ParamKind="duration"|"temperature"|"concentration"|"cell_density"|"centrifugation";
export type MethodParam={kind:ParamKind;agent:string;display:string;normalized:string;quote:string};
const MAX_SENTENCE=240;
const sentences=(t:string)=>t.replace(/\s+/g," ").split(/(?<=[.;])\s+(?=[A-Z(])/).map(s=>s.trim()).filter(s=>s.length>8&&s.length<1500);
const clip=(s:string,at:number)=>{const h=Math.floor(MAX_SENTENCE/2),a=Math.max(0,at-h),b=Math.min(s.length,at+h);return (a>0?"…":"")+s.slice(a,b).trim()+(b<s.length?"…":"")};
const UNIT_MAP:Record<string,string>={"µ":"u","μ":"u"};
const normUnit=(u:string)=>u.replace(/[µμ]/g,m=>UNIT_MAP[m]!).toLowerCase().replace(/\s+/g,"");
const num=(s:string)=>Number(s.replace(/,/g,""));
const TIME=/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|min|days?|d)\b/gi;
const TEMP=/(\d{1,3}(?:\.\d)?)\s*(?:°|º|˚|degrees?\s*)\s*C\b/gi;
// Mass and activity units are matched case-insensitively. Molar units are case-sensitive on purpose: "nm" and "mm" are length units (wavelengths, millimetres), "nM" and "mM" are concentrations.
const CONC=/(\d+(?:\.\d+)?)\s*(ng\/ml|[µμ]g\/ml|mg\/ml|pg\/ml|iu\/ml|u\/ml|[µμ]g\/l|ng\/l)(?![a-z])/gi;
const MOLAR=/(\d+(?:\.\d+)?)\s*(pM|nM|[µμ]M|mM)(?![A-Za-z])/g;
const DENS_SCI=/(\d+(?:\.\d+)?)\s*[×x]\s*10\s*\^?\s*[({]?\s*(\d+)\s*[)}]?\s*cells?\s*(?:\/|per)\s*(ml|well|cm2|cm²)/gi;
const DENS_PLAIN=/(\d[\d,]{3,})\s*cells?\s*(?:\/|per)\s*(ml|well|cm2|cm²)/gi;
const G_FORCE=/(\d[\d,]*)\s*(?:×|x)?\s*g\b(?![a-z])/g;
const RPM=/(\d[\d,]*)\s*rpm\b/gi;
const minutes=(v:number,u:string)=>/^h/i.test(u)?v*60:/^d/i.test(u)?v*1440:v;
/** The few words before a value, as a hint for what it applies to (for example an agent name). Heuristic. */
const agentBefore=(s:string,idx:number)=>{
 const before=s.slice(Math.max(0,idx-60),idx).replace(/[\s(,:;]+$/,"").replace(/\b(at|of|with|using|in|to|for|a|the|final|concentration|concentrations)\s*$/i,"").trim();
 const m=/([A-Za-z0-9][A-Za-z0-9\-+/.\s]{1,30})$/.exec(before);let w=(m?.[1]??"").trim().split(/\s+/).slice(-3).join(" ").replace(/^(and|or|with|plus)\s+/i,"");
 // A hint that reads like a clause rather than a reagent is dropped; the quote still shows the context.
 if(/\b(was|were|is|are|measured|performed|diluted|added|read|at)\b/i.test(w)||/^(and|or|at|of)$/i.test(w))w="";
 return w.toLowerCase().slice(0,40);
};
export function extractParameters(text:string,max=80):MethodParam[]{
 const out:MethodParam[]=[];const seen=new Set<string>();
 const add=(p:MethodParam)=>{const k=p.kind+"|"+p.agent+"|"+p.normalized+"|"+p.quote.slice(0,40);if(!seen.has(k)&&out.length<max){seen.add(k);out.push(p)}};
 for(const s of sentences(text)){
  if(/\b(incubat|cultur|stimulat|treat|expos|activat|differentiat|polariz)/i.test(s))for(const m of s.matchAll(TIME)){const v=num(m[1]!);if(v>0&&v<=100000){const mins=minutes(v,m[2]!);add({kind:"duration",agent:agentBefore(s,m.index!).replace(/\b(for|during)$/,"").trim(),display:`${m[1]} ${m[2]}`,normalized:String(mins)+"min",quote:clip(s,m.index!)})}}
  // Only incubation or culture temperatures: storage, freezing and on-ice steps are different things and are not compared with them.
  if(/incubat|cultur|stimulat|maintain|grown|expanded/i.test(s)&&!/\b(stor|freez|frozen|cold|on ice|ice-cold|overnight at 4|lysat)/i.test(s))for(const m of s.matchAll(TEMP)){const v=num(m[1]!);if(v>=-90&&v<=121)add({kind:"temperature",agent:"",display:`${m[1]} °C`,normalized:String(v)+"C",quote:clip(s,m.index!)})}
  for(const m of s.matchAll(CONC)){add({kind:"concentration",agent:agentBefore(s,m.index!),display:`${m[1]} ${m[2]!.replace(/[μ]/g,"µ")}`,normalized:`${num(m[1]!)}${normUnit(m[2]!)}`,quote:clip(s,m.index!)})}
  for(const m of s.matchAll(MOLAR)){add({kind:"concentration",agent:agentBefore(s,m.index!),display:`${m[1]} ${m[2]!.replace(/[μ]/g,"µ")}`,normalized:`${num(m[1]!)}${m[2]!.replace(/[µμ]/g,"u")}`,quote:clip(s,m.index!)})}
  for(const m of s.matchAll(DENS_SCI)){const v=num(m[1]!)*10**num(m[2]!);add({kind:"cell_density",agent:"",display:`${m[1]} × 10^${m[2]} cells/${m[3]!.toLowerCase()}`,normalized:`${v}/${m[3]!.toLowerCase().replace("²","2")}`,quote:clip(s,m.index!)})}
  for(const m of s.matchAll(DENS_PLAIN)){const v=num(m[1]!);if(v>=1000)add({kind:"cell_density",agent:"",display:`${m[1]} cells/${m[2]!.toLowerCase()}`,normalized:`${v}/${m[2]!.toLowerCase().replace("²","2")}`,quote:clip(s,m.index!)})}
  if(/centrifug|spun|pellet/i.test(s)){
   for(const m of s.matchAll(G_FORCE)){const v=num(m[1]!);if(v>=50&&v<=300000)add({kind:"centrifugation",agent:"",display:`${m[1]} × g`,normalized:`${v}g`,quote:clip(s,m.index!)})}
   for(const m of s.matchAll(RPM)){const v=num(m[1]!);if(v>=100&&v<=100000)add({kind:"centrifugation",agent:"",display:`${m[1]} rpm`,normalized:`${v}rpm`,quote:clip(s,m.index!)})}
  }
 }
 return out;
}
export type PaperParams={id:string;title:string;url:string;licence:string;params:MethodParam[]};
export type ComparisonRow={kind:ParamKind;agent:string;label:string;byPaper:{paperId:string;values:{display:string;quote:string}[]}[];differs:boolean;papersReporting:number};
const LABEL:Record<ParamKind,string>={duration:"Duration (any step)",temperature:"Incubation or culture temperature",concentration:"Concentration",cell_density:"Cell density",centrifugation:"Centrifugation"};
/** Rows where at least two papers report the same kind of parameter. `differs` means the normalised values are not identical across papers. It does not say which is better or why. */
export function compareMethods(papers:readonly PaperParams[]):ComparisonRow[]{
 const groups=new Map<string,Map<string,MethodParam[]>>();
 for(const p of papers)for(const m of p.params){
  // Centrifugation in g and in rpm are not comparable without the rotor, so they are grouped apart and never compared with each other.
  const key=m.kind+"|"+((m.kind==="concentration"||m.kind==="duration")?m.agent:m.kind==="centrifugation"?(m.normalized.endsWith("rpm")?"rpm":"g"):"");
  const g=groups.get(key)??new Map<string,MethodParam[]>();g.set(p.id,[...(g.get(p.id)??[]),m]);groups.set(key,g);
 }
 const rows:ComparisonRow[]=[];
 for(const [key,g] of groups){
  if(g.size<2)continue;
  const [kind,agent]=key.split("|") as [ParamKind,string];
  const norm=new Set<string>();for(const ms of g.values())for(const m of ms)norm.add(m.normalized);
  rows.push({kind,agent,label:LABEL[kind]+(agent?` · ${agent}`:""),papersReporting:g.size,differs:norm.size>1,
   byPaper:[...g.entries()].map(([paperId,ms])=>({paperId,values:ms.slice(0,4).map(m=>({display:m.display,quote:m.quote}))}))});
 }
 // Rows with no identified reagent or step lump unrelated steps together, so they come after rows that name one.
 const generic=(r:ComparisonRow)=>r.agent===""&&(r.kind==="duration"||r.kind==="concentration");
 return rows.sort((a,b)=>Number(generic(a))-Number(generic(b))||Number(b.differs)-Number(a.differs)||b.papersReporting-a.papersReporting||a.label.localeCompare(b.label)).slice(0,40);
}
