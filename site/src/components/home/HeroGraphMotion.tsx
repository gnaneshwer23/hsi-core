/** Animated structure of a connected graph for the homepage hero. Illustrative: it shows how entities, relationships and evidence connect, not data. */
const NODES=[
  {id:"a",x:92,y:210,r:11},{id:"b",x:210,y:110,r:14},{id:"c",x:214,y:300,r:10},{id:"d",x:340,y:196,r:16},
  {id:"e",x:454,y:96,r:10},{id:"f",x:470,y:262,r:12},{id:"g",x:330,y:352,r:9},{id:"h",x:352,y:56,r:8},
] as const;
const EDGES=[["a","b"],["a","c"],["b","d"],["c","d"],["d","e"],["d","f"],["c","g"],["b","h"],["e","f"],["g","f"]] as const;
const at=(id:string)=>NODES.find(n=>n.id===id)!;

export function HeroGraphMotion(){
  return (
    <figure className="hx-motion" aria-label="Illustrative animated graph">
      <div className="hx-motion-top"><span>Graph structure</span><span>Illustrative · not data</span></div>
      <svg viewBox="0 0 560 410" role="img" aria-labelledby="hx-motion-t hx-motion-d">
        <title id="hx-motion-t">Animated schematic of connected entities</title>
        <desc id="hx-motion-d">Entities are joined by relationships. Pulses travel along the relationships to show that each carries evidence. The animation is decorative and does not represent real data.</desc>
        {EDGES.map(([s,t],i)=>{const a=at(s),b=at(t);return <line key={s+t} className="hx-edge" style={{["--i" as string]:i}} x1={a.x} y1={a.y} x2={b.x} y2={b.y}/>})}
        {NODES.map((n,i)=>(
          <g key={n.id} className="hx-node" style={{["--i" as string]:i}}>
            <circle className="hx-halo" cx={n.x} cy={n.y} r={n.r+9}/>
            <circle className="hx-dot" cx={n.x} cy={n.y} r={n.r}/>
          </g>
        ))}
      </svg>
      <ul className="hx-motion-legend" aria-label="What each relationship carries">
        <li><i/>Source</li><li><i/>Context</li><li><i/>Review status: unreviewed</li>
      </ul>
    </figure>
  );
}
