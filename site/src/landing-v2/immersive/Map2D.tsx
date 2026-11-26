import {ENV_EDGES,ENV_ENTITIES,posOf,scaleOf,weakestInEnv,type Emphasis,type Layer} from "./environment";
import {STATUS_META,type AtlasStatus} from "../components/atlas/atlasData";

const W=760,H=520,X=118,Y=104;
const px=(id:string)=>W/2+posOf(id)[0]*X+posOf(id)[2]*10;
const py=(id:string)=>H/2-posOf(id)[1]*Y;
const DOMAIN:Record<string,string>={microbiome:"#83B8AD",immunology:"#7FA6B8",neuroscience:"#D8B477",disease:"#C9CED2",organ:"#A7B6BF",genomics:"#B7A8D0"};
const STATUS:Record<AtlasStatus,string>={supported:"#83B8AD",association:"#D8B477",hypothesis:"#7FA6B8",contested:"#E07A7A"};

/** The same environment as a front-on map. Works without WebGL, and every node is a keyboard-operable button. */
export function Map2D({layer,selected,emphasis,onSelect,onHover}:{layer:Layer;selected:string|null;emphasis:Emphasis;onSelect:(id:string|null)=>void;onHover:(id:string|null)=>void}){
 return (
  <svg viewBox={`0 0 ${W} ${H}`} className="im-map" role="group" aria-label="Gut, immune and brain environment, front view" onClick={()=>onSelect(null)}>
   <text x="14" y="34" className="im-zone">BRAIN</text><text x="14" y={H/2+4} className="im-zone">IMMUNE</text><text x="14" y={H-22} className="im-zone">GUT</text>
   {ENV_EDGES.map(e=>{
    const dim=!emphasis.edges.has(e.id),dashed=e.status==="contested"||e.status==="hypothesis";
    return <line key={e.id} x1={px(e.from)} y1={py(e.from)} x2={px(e.to)} y2={py(e.to)} stroke={STATUS[e.status]} strokeWidth={dim?1:2} strokeDasharray={dashed?"6 5":undefined} opacity={dim?.14:.9}/>;
   })}
   {ENV_ENTITIES.map(e=>{
    const dim=!emphasis.entities.has(e.id),sel=selected===e.id,w=weakestInEnv(e.id);
    const fill=layer==="mechanisms"?DOMAIN[e.domain]??"#A7B6BF":STATUS[w??"supported"];
    return (
     <g key={e.id} role="button" tabIndex={0} aria-pressed={sel} aria-label={`${e.label}, ${scaleOf(e.id)} scale${w?`, weakest evidence: ${STATUS_META[w].short}`:""}`}
      className="im-node" onClick={ev=>{ev.stopPropagation();onSelect(sel?null:e.id)}}
      onKeyDown={ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();onSelect(sel?null:e.id)}}}
      onPointerEnter={()=>onHover(e.id)} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover(e.id)} onBlur={()=>onHover(null)} opacity={dim?.3:1}>
      <circle cx={px(e.id)} cy={py(e.id)} r={sel?17:12} fill={fill} fillOpacity={.85} stroke={sel?"#F4F6F5":fill} strokeWidth={sel?2.5:1}/>
      <text x={px(e.id)} y={py(e.id)+(sel?32:27)} textAnchor="middle" className="im-label">{e.label}</text>
     </g>
    );
   })}
  </svg>
 );
}
