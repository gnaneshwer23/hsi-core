/** One stroke-icon family for the research app shell (24px grid, 1.7 stroke). Decorative: always aria-hidden. */
const P:Record<string,string>={
 home:"M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10",
 flask:"M9 3h6M10 3v6L4.5 18.2A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.8L14 9V3M7.5 15h9",
 graph:"M6 7.5a2 2 0 1 0 0-.01M18 5.5a2 2 0 1 0 0-.01M18 18.5a2 2 0 1 0 0-.01M6 17a2 2 0 1 0 0-.01M7.8 8.2l8.4-1.8M7.5 15.6l9-7.4M16.2 17.6 8 17M12 12l0 0",
 layers:"M12 3 3 8l9 5 9-5-9-5ZM3 12.5l9 5 9-5M3 17l9 5 9-5",
 book:"M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5",
 bell:"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15l1.5-2ZM10 21a2 2 0 0 0 4 0",
 search:"M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5",
 shield:"M12 3 4.5 6v5.5c0 4.5 3.1 8 7.5 9.5 4.4-1.5 7.5-5 7.5-9.5V6L12 3Z",
 brain:"M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 4.5A3.2 3.2 0 0 0 6 17a3 3 0 0 0 5 1.5V5.5A2.5 2.5 0 0 0 9 4ZM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 4.5 3.2 3.2 0 0 1-2 5.5 3 3 0 0 1-5 1.5V5.5A2.5 2.5 0 0 1 15 4Z",
 microbe:"M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8",
 metabolism:"M6 6.5a2 2 0 1 0 0-.01M18 8a2 2 0 1 0 0-.01M12 18a2 2 0 1 0 0-.01M7.7 7.3 10.6 16.2M16.3 9.6 13.4 16.3M8 6.8l8 1",
 dna:"M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12M8.5 7.5h7M8.5 16.5h7",
 pill:"M10.5 20.5a4.6 4.6 0 0 1-6.5-6.5l9-9a4.6 4.6 0 0 1 6.5 6.5l-9 9ZM8.5 8.5l7 7",
 heart:"M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10ZM6 12h3l1.5-2.5L13 14l1.5-2H18",
 cross:"M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4Z",
 plus:"M12 5v14M5 12h14",
 spark:"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7L19 17Z",
 chevron:"M9 6l6 6-6 6",
 user:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21a7.5 7.5 0 0 1 15 0",
 help:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01",
 menu:"M4 7h16M4 12h16M4 17h16",
 x:"M6 6l12 12M18 6 6 18",
 arrow:"M5 12h14M13 6l6 6-6 6",
 check:"M5 12.5l4.5 4.5L19 7.5",
 palette:"M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.5-1.2-1.7-1.2-3 0-1 .8-1.8 1.9-1.8H17a4 4 0 0 0 4-4c0-3.9-4-7.2-9-7.2ZM7.5 11a1 1 0 1 0 0-.01M10 7.5a1 1 0 1 0 0-.01M14.5 7.5a1 1 0 1 0 0-.01",
 trend:"M4 17l6-6 4 4 6-8M15 7h5v5",
 target:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 12h.01",
 compass:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
 users:"M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 5.3a3.5 3.5 0 0 1 0 6.4M17.5 14a6.5 6.5 0 0 1 4 6",
 chart:"M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3",
 clipboard:"M9 4h6v3H9V4ZM7 5.5H5.5v15h13v-15H17M9 12h6M9 16h4",
};
export function Icon({name,size=20}:{name:string;size?:number}){
 return <svg className="rh-ico" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={P[name]??P.graph}/></svg>;
}
export const DEPT_ICON:Record<string,string>={immunology:"shield",neuroscience:"brain",microbiome:"microbe",metabolism:"metabolism","genomics-multi-omics":"dna",genomics:"dna",pharmacology:"pill","human-physiology":"heart","clinical-research":"cross"};
/** Original decorative network used in the hero. Not data. */
export function HeroNetwork(){
 const nodes:[number,number,number][]=[[60,40,5],[150,90,8],[250,50,4],[330,120,7],[230,170,5],[120,190,4],[40,130,6],[300,210,4]];
 const edges:[number,number][]=[[0,1],[1,2],[2,3],[1,4],[4,3],[1,5],[5,6],[0,6],[4,7],[3,7],[5,4]];
 return (
  <svg className="rh-hero-net" viewBox="0 0 380 250" aria-hidden="true" focusable="false">
   <defs><radialGradient id="rh-g" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#6753a1" stopOpacity=".28"/><stop offset="1" stopColor="#6753a1" stopOpacity="0"/></radialGradient></defs>
   <circle cx="190" cy="125" r="120" fill="url(#rh-g)"/>
   {edges.map(([a,b],i)=><line key={i} x1={nodes[a]![0]} y1={nodes[a]![1]} x2={nodes[b]![0]} y2={nodes[b]![1]} className="rh-hn-edge" style={{animationDelay:i*.3+"s"}}/>)}
   {nodes.map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} className="rh-hn-node" style={{animationDelay:i*.25+"s"}}/>)}
  </svg>
 );
}
