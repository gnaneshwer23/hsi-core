import {useId, type ReactNode} from 'react';
import '../../styles/hero-artwork.css';

type ArtworkKind = 'platform'|'technology'|'products'|'research'|'science'|'workflow'|'solutions'|'evidence'|'access'|'aksh'|'immune'|'trials';
const descriptions:Record<ArtworkKind,{label:string;title:string;caption:string}>={
  platform:{label:'THE RESEARCH FOUNDATION',title:'Layered architecture connecting sources, biological context and independent review',caption:'Shared capabilities. Separate product data.'},
  technology:{label:'CONNECTED KNOWLEDGE',title:'A network of entities with a highlighted route through source context',caption:'Connections retain their source context.'},
  products:{label:'DISTINCT PRODUCT EXPERIENCES',title:'Four separate product orbits around shared research methods',caption:'One foundation. Four distinct responsibilities.'},
  research:{label:'THE INVESTIGATION RECORD',title:'An open research dossier connecting a question, evidence and a reviewable brief',caption:'The evidence travels with the question.'},
  science:{label:'BIOLOGY AT DIFFERENT SCALES',title:'An illustrative tissue section magnified to reveal cells and their nuclei',caption:'From tissue context to cellular detail.'},
  workflow:{label:'QUESTION TO RESEARCH BRIEF',title:'A continuous investigation path through question, sources, context and human review',caption:'A visible path from question to interpretation.'},
  solutions:{label:'RESEARCH PERSPECTIVES',title:'Overlapping research lenses for mechanisms, evidence and translation',caption:'Different perspectives. A shared evidence trail.'},
  evidence:{label:'PROVENANCE & INTERPRETATION',title:'A source passage connected to study context, uncertainty and independent review',caption:'A citation is the beginning of an examination.'},
  access:{label:'YOUR RESEARCH ACCESS PATH',title:'An identity key passing through separate verification and permission boundaries',caption:'Verify identity. Provision permissions separately.'},
  aksh:{label:'PERSONAL HEALTH CONTEXT',title:'An illustrative set of daily health observations organised around the person',caption:'Everyday context belongs in its own care setting.'},
  immune:{label:'IMMUNE BIOLOGY',title:'A conceptual immune cell with a folded nucleus and surrounding signalling molecules',caption:'Explore cell states in their biological setting.'},
  trials:{label:'STUDY CONTEXT & CRITERIA',title:'A study record with separate documented, unresolved and investigator-review criteria',caption:'Research relevance requires investigator review.'},
};

function Dot({x,y,r=5,coral=false}:{x:number;y:number;r?:number;coral?:boolean}){return <circle cx={x} cy={y} r={r} fill={coral?'#e36a4b':'#237a72'}/>}
function Note({x,y,title,children}:{x:number;y:number;title:string;children?:ReactNode}){return <g transform={`translate(${x} ${y})`}><rect width="186" height="68" rx="8" fill="#fff" stroke="#c5dcd3"/><text x="16" y="27" className="ha-label">{title}</text><text x="16" y="48" className="ha-small">{children}</text></g>}
function Cell({x,y,r=42,fill}:{x:number;y:number;r?:number;fill:string}){return <g><circle cx={x} cy={y} r={r} fill={fill} stroke="#67a89b" strokeWidth="1.5"/><circle cx={x} cy={y} r={r*.73} fill="none" stroke="#fff" strokeOpacity=".7"/><ellipse cx={x-3} cy={y+2} rx={r*.37} ry={r*.3} fill="#17645f" fillOpacity=".75"/><circle cx={x-8} cy={y-3} r={r*.09} fill="#eaf6ed"/>{[0,1,2,3,4].map(i=><circle key={i} cx={x+Math.cos(i*1.25)*r*.54} cy={y+Math.sin(i*1.25)*r*.54} r="2.5" fill="#17645f" fillOpacity=".5"/>)}</g>}

/** Original editorial diagrams. These depict concepts, never measured findings or live product screens. */
export function HeroArtwork({kind}:{kind:ArtworkKind}){
  const id='ha'+useId().replace(/[^a-zA-Z0-9]/g,''),d=descriptions[kind];
  const glass=`url(#${id}-glass)`,mint=`url(#${id}-mint)`;
  return <figure className={`hero-artwork hero-artwork-${kind}`} data-artwork={kind}>
    <div className="ha-eyebrow"><span aria-hidden="true"/>{d.label}</div>
    <svg viewBox="0 0 560 500" role="img" aria-label={d.title}>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e4f5ee" stopOpacity=".95"/><stop offset=".55" stopColor="#a4d5ca" stopOpacity=".7"/><stop offset="1" stopColor="#f6fcf8"/></linearGradient>
        <radialGradient id={`${id}-mint`} cx=".32" cy=".25" r=".8"><stop stopColor="#f4fff9"/><stop offset=".55" stopColor="#9acebe"/><stop offset="1" stopColor="#3f8c7c"/></radialGradient>
      </defs>
      <g className="ha-grid" aria-hidden="true">{[100,180,260,340,420].map(x=><path key={x} d={`M${x} 30V470 M30 ${x}H530`}/>)}</g>

      {kind==='platform'&&<g>
        {[0,1,2].map((n)=><g key={n} transform={`translate(0 ${n*95})`}><path d="M280 66 490 164 280 270 70 164Z" fill={n===2?'#17645f':glass} stroke="#83b9aa" strokeWidth="1.5"/><path d="M70 164V177L280 283 490 177V164L280 270Z" fill={n===2?'#104d48':'#cae7db'} stroke="#83b9aa"/><text x="280" y="170" textAnchor="middle" fill={n===2?'#fff':'#17645f'} fontSize="18" fontWeight="500" transform="rotate(-1 280 170)">{['Source identity','Biological context','Independent review'][n]}</text></g>)}
        <path d="M70 164V366M490 164V366" stroke="#d57b61" strokeDasharray="4 7"/>
        <Dot x={70} y={164} coral/><Dot x={490} y={366} coral/>
      </g>}

      {kind==='technology'&&<g>
        <g fill="none" stroke="#90beb1" strokeWidth="1.5">{[[80,200,180,110],[180,110,300,172],[300,172,450,100],[80,200,195,278],[195,278,300,172],[195,278,355,348],[355,348,460,255],[460,255,300,172],[195,278,100,399],[355,348,440,430],[80,200,65,80]].map(([x,y,a,b],i)=><path key={i} d={`M${x} ${y}L${a} ${b}`}/>)}</g>
        <path d="M180 110 300 172 195 278 355 348" stroke="#dd795d" strokeWidth="3" fill="none"/>
        {[[80,200,25],[180,110,32],[300,172,46],[450,100,22],[195,278,35],[355,348,37],[460,255,25],[100,399,20],[440,430,18],[65,80,15]].map(([x,y,r],i)=><g key={i}><circle cx={x} cy={y} r={r} fill={i===2?mint:'#edf7f1'} stroke="#70a99a"/><circle cx={x} cy={y} r={r/4} fill={i===2?'#fff':'#237a72'}/></g>)}
        <Note x={36} y={28} title="TRACE THE CONNECTION">Entity · source · context</Note><Note x={280} y={401} title="INSPECT THE PATH">Association ≠ causation</Note>
      </g>}

      {kind==='products'&&<g>
        <ellipse cx="280" cy="255" rx="213" ry="175" fill="none" stroke="#b7d6c9" strokeDasharray="3 9"/>
        <path d="M135 125 280 255 421 125M134 377 280 255 421 377" fill="none" stroke="#8ab7a7"/>
        <circle cx="280" cy="255" r="74" fill={mint} stroke="#5b9c88"/><text x="280" y="251" textAnchor="middle" fill="#124f45" fontSize="28">HSI</text><text x="280" y="277" textAnchor="middle" className="ha-small">Shared methods</text>
        {[[135,125,'Aksh Health','Personal context'],[421,125,'ISI Research','Immune biology'],[134,377,'HSI Clinical','In development'],[421,377,'HSI Trials','Planned']].map(([x,y,name,scope],i)=><g key={name} transform={`translate(${x} ${y})`}><circle r="63" fill={i<2?'#e1f1e9':'#f7f4ed'} stroke={i<2?'#70a793':'#c4b5a0'}/><circle r="53" fill="none" stroke="#fff"/><text y="0" textAnchor="middle" className="ha-label">{name}</text><text y="22" textAnchor="middle" className="ha-small">{scope}</text></g>)}
      </g>}

      {kind==='research'&&<g>
        <g transform="translate(72 66) rotate(-7 170 175)"><rect x="-10" y="-12" width="330" height="350" rx="8" fill="#e3eee5" stroke="#bfdbcc"/><rect width="330" height="350" rx="8" fill="#fff" stroke="#b8d6c6"/><text x="26" y="44" className="ha-label">RESEARCH QUESTION</text><path d="M26 67H270M26 79H224M26 108H288" stroke="#bfd7c9"/><text x="26" y="147" className="ha-small">Sources & study context</text><path d="M26 170H288M26 185H260M26 200H280" stroke="#bfd7c9"/><circle cx="88" cy="265" r="23" fill={mint}/><circle cx="182" cy="250" r="16" fill="#e0eee4" stroke="#7eaa91"/><circle cx="252" cy="284" r="24" fill="#f6dfd4"/><path d="M112 260 166 252M198 257 230 275" stroke="#73a38d"/></g>
        <g transform="translate(252 253) rotate(5)"><rect width="245" height="183" rx="9" fill="#17645f"/><text x="22" y="38" fill="#eaf6ed" fontSize="13">RESEARCH BRIEF</text><path d="M22 57H219" stroke="#60978a"/><text x="22" y="89" fill="#fff" fontSize="16">What the evidence shows</text><text x="22" y="117" fill="#e1eee6" fontSize="12">Context · conflicts · missing data</text><path d="M22 143H178" stroke="#8fb5a7"/><Dot x={213} y={148} coral/></g>
      </g>}

      {kind==='science'&&<g>
        <path d="M60 174Q150 75 264 133T449 148V355Q340 303 259 350T60 368Z" fill={glass} stroke="#82b5a3" strokeWidth="1.5"/>
        {[[112,188,35],[192,176,36],[267,195,33],[345,181,36],[414,207,31],[96,265,30],[169,253,34],[243,268,37],[323,257,31],[393,276,36],[127,332,28],[207,324,29]].map(([x,y,r],i)=><Cell key={i} x={x} y={y} r={r} fill={glass}/>)}
        <path d="M324 260 401 347M356 229 481 306" stroke="#db8365" strokeDasharray="4 6"/>
        <circle cx="435" cy="375" r="83" fill="#fafcf9" stroke="#dc8a6a" strokeWidth="1.5"/><Cell x={435} y={375} r={67} fill={mint}/>
        <text x="61" y="426" className="ha-label">TISSUE → CELL → CONTEXT</text><text x="61" y="448" className="ha-small">Schematic · not microscopy</text>
      </g>}

      {kind==='workflow'&&<g>
        <path d="M100 100H365Q464 100 464 200T365 300H190Q95 300 95 394H455" stroke="#c5dfd2" strokeWidth="30" strokeLinecap="round" fill="none"/>
        <path d="M100 100H365Q464 100 464 200T365 300H190Q95 300 95 394H455" stroke="#78aa98" strokeWidth="1.5" strokeDasharray="3 7" fill="none"/>
        {[[100,100,'01','Question'],[357,100,'02','Sources'],[443,260,'03','Context'],[190,300,'04','Review'],[274,394,'05','Brief']].map(([x,y,n,label])=><g key={n}><circle cx={x} cy={y} r="25" fill={n==='04'?'#f6dfd4':'#fff'} stroke="#6d9e89"/><text x={x} y={Number(y)+5} textAnchor="middle" className="ha-label">{n}</text><text x={x} y={Number(y)-42} textAnchor="middle" className="ha-label">{label}</text></g>)}
        <path d="m438 382 18 12-18 12" fill="none" stroke="#17645f" strokeWidth="2"/>
      </g>}

      {kind==='solutions'&&<g>
        <circle cx="207" cy="217" r="130" fill={glass} stroke="#8bb6a2"/><circle cx="352" cy="217" r="130" fill={glass} stroke="#8bb6a2"/><circle cx="280" cy="338" r="130" fill={glass} stroke="#8bb6a2"/>
        <text x="154" y="183" className="ha-label">Mechanisms</text><text x="354" y="183" className="ha-label">Evidence</text><text x="280" y="397" textAnchor="middle" className="ha-label">Translation</text>
        <circle cx="280" cy="263" r="46" fill="#17645f"/><text x="280" y="258" textAnchor="middle" fill="#fff" fontSize="13">Research</text><text x="280" y="279" textAnchor="middle" fill="#fff" fontSize="13">question</text><Dot x={280} y={38} coral/>
      </g>}

      {kind==='evidence'&&<g>
        <rect x="59" y="71" width="295" height="349" rx="8" fill="#fff" stroke="#bcd7c8"/><text x="83" y="112" className="ha-label">ORIGINAL SOURCE</text><path d="M83 136H329M83 156H303M83 176H320" stroke="#c1d8cb"/>
        <rect x="80" y="198" width="248" height="74" rx="4" fill="#e4f2e7"/><path d="M94 218H310M94 235H294M94 252H241" stroke="#73a98d"/>
        <path d="M83 300H320M83 320H300M83 340H311M83 360H230" stroke="#c1d8cb"/><path d="M328 236H365V135M365 236V361" stroke="#8ab4a0" fill="none"/>
        <Note x={325} y={100} title="Study context">Species · tissue · assay</Note><Note x={325} y={208} title="Uncertainty">Conflicts & missing evidence</Note><Note x={325} y={316} title="Human review">A scoped, recorded decision</Note>
      </g>}

      {kind==='access'&&<g>
        <ellipse cx="280" cy="240" rx="185" ry="163" fill="none" stroke="#c3ddce"/><ellipse cx="280" cy="240" rx="139" ry="123" fill="none" stroke="#9dc5b0" strokeDasharray="4 8"/>
        <g transform="rotate(-35 280 240)"><circle cx="240" cy="210" r="58" fill={glass} stroke="#67a38d" strokeWidth="2"/><circle cx="240" cy="210" r="25" fill="#fafbf9" stroke="#67a38d"/><path d="M280 245V363H316V335H338V308H316V245" fill={mint} stroke="#67a38d" strokeWidth="2"/></g>
        <Note x={24} y={53} title="01 / VERIFY IDENTITY">Your account & email</Note><Note x={345} y={344} title="02 / CHECK ACCESS">Roles & source permissions</Note><Dot x={463} y={218} coral/>
      </g>}

      {kind==='aksh'&&<g>
        <circle cx="280" cy="248" r="167" fill="none" stroke="#a5cbb9"/><circle cx="280" cy="248" r="117" fill="none" stroke="#cce2d6" strokeDasharray="4 8"/>
        <circle cx="280" cy="248" r="76" fill={mint}/><circle cx="280" cy="229" r="19" fill="#f5fbf6"/><path d="M245 285Q245 250 280 250T315 285" fill="#f5fbf6"/>
        {[[120,110,'Sleep','Daily rhythm'],[360,90,'Activity','Everyday movement'],[352,347,'Health trends','Longitudinal context'],[26,322,'Care review','Professional setting']].map(([x,y,t,s])=><Note key={t} x={Number(x)} y={Number(y)} title={String(t)}>{s}</Note>)}
      </g>}

      {kind==='immune'&&<g>
        <circle cx="280" cy="249" r="174" fill="none" stroke="#badbce" strokeDasharray="3 8"/><path d="M125 212C109 128 208 77 280 105S444 130 436 232 408 395 303 410 118 335 125 212Z" fill={mint} stroke="#699e87" strokeWidth="2"/>
        <path d="M146 215C133 145 211 97 281 123S424 143 417 232 389 376 301 390 140 321 146 215Z" fill="none" stroke="#ecfcf0" strokeWidth="2"/>
        <path d="M224 179C164 197 185 260 223 263S292 281 266 313 302 365 338 314 319 225 286 221 270 165 224 179Z" fill="#246c60" stroke="#b2daca" strokeWidth="2"/>
        {[[192,147],[352,173],[380,274],[202,337],[330,368],[157,262],[270,149]].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y} rx="13" ry="6" fill="#c3e4ce" transform={`rotate(${i*27} ${x} ${y})`}/></g>)}
        {[[87,142],[458,167],[471,331],[99,359]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="13" fill="#f4d6c9" stroke="#d68f76"/><path d={`M${x} ${y}L280 249`} stroke="#d68f76" strokeDasharray="3 8" opacity=".5"/></g>)}
        <text x="280" y="463" textAnchor="middle" className="ha-small">Cell state · tissue · signalling context</text>
      </g>}

      {kind==='trials'&&<g>
        <rect x="77" y="61" width="361" height="374" rx="12" fill={glass} stroke="#99bda7"/><rect x="99" y="78" width="361" height="374" rx="12" fill="#fff" stroke="#b6d0be"/>
        <text x="126" y="121" className="ha-label">STUDY RESEARCH RECORD</text><path d="M126 143H430" stroke="#c2d8c6"/>
        {['Population & study context','Documented criteria','Missing information','Investigator assessment'].map((s,i)=><g key={s}><circle cx="141" cy={184+i*66} r="13" fill={i===2?'#f4dfd2':'#e1eee3'} stroke={i===2?'#c88c68':'#80a88b'}/><text x="141" y={189+i*66} textAnchor="middle" className="ha-label">{i===2?'?':i===3?'→':'·'}</text><text x="167" y={189+i*66} className="ha-label">{s}</text><path d={`M167 ${205+i*66}H417`} stroke="#dfebe0"/></g>)}
      </g>}
    </svg>
    <figcaption><span>{d.caption}</span><small>Concept illustration</small></figcaption>
  </figure>;
}
