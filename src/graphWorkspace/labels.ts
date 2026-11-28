/**
 * Label placement for the 2D graph. Labels never overlap one another or a dot as connected as their own: they are placed in priority order (selected,
 * hovered, traced, neighbours of the selection, then the most connected concepts), each at the first of four positions
 * around its dot that is free, and a label that fits nowhere is left out. Hovering or selecting a dot always shows
 * its own label. Placement is in layout units at the current zoom, so zooming in makes room for more labels.
 */
export type LabelInput={id:string;label:string;x:number;y:number;r:number;degree:number;priority:number};
export type PlacedLabel={id:string;text:string;x:number;y:number;anchor:"start"|"middle"|"end"};
export const LABEL_FONT_PX=11;
export const LABEL_MAX_CHARS=28;
const CHAR_W=.56,LINE_H=1.25,PAD=2;

type Box={x0:number;y0:number;x1:number;y1:number};
const hit=(a:Box,b:Box)=>a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1;
export const labelText=(s:string)=>s.length>LABEL_MAX_CHARS?s.slice(0,LABEL_MAX_CHARS-1)+"…":s;

/** `k` is the zoom factor; labels keep a constant on-screen size, so their footprint in layout units is 1/k. */
export function placeLabels(items:readonly LabelInput[],k:number,minDegree:number):PlacedLabel[]{
 const fs=LABEL_FONT_PX/k,h=fs*LINE_H,pad=PAD/k;
 const out:PlacedLabel[]=[];
 // Dots are obstacles too, so a label never covers another concept.
 // A label may pass over a smaller dot (the halo keeps both readable) but never over a dot as connected as its own.
 const dots=items.map(i=>({id:i.id,degree:i.degree,box:{x0:i.x-i.r,y0:i.y-i.r,x1:i.x+i.r,y1:i.y+i.r}}));
 const placed:Box[]=[];
 const order=[...items].filter(i=>i.priority>0||i.degree>=minDegree).sort((a,b)=>b.priority-a.priority||b.degree-a.degree||a.id.localeCompare(b.id));
 for(const i of order){
  const text=labelText(i.label),w=text.length*fs*CHAR_W,gap=i.r+3/k;
  const options:[number,number,PlacedLabel["anchor"],Box][]=[
   [i.x,i.y+gap+fs,"middle",{x0:i.x-w/2-pad,y0:i.y+gap,x1:i.x+w/2+pad,y1:i.y+gap+h}],
   [i.x,i.y-gap-fs*.3,"middle",{x0:i.x-w/2-pad,y0:i.y-gap-h,x1:i.x+w/2+pad,y1:i.y-gap}],
   [i.x+gap,i.y+fs*.35,"start",{x0:i.x+gap-pad,y0:i.y-h/2,x1:i.x+gap+w+pad,y1:i.y+h/2}],
   [i.x-gap,i.y+fs*.35,"end",{x0:i.x-gap-w-pad,y0:i.y-h/2,x1:i.x-gap+pad,y1:i.y+h/2}],
  ];
  const free=options.find(o=>!placed.some(p=>hit(p,o[3]))&&!dots.some(d=>d.id!==i.id&&d.degree>=i.degree&&hit(d.box,o[3])));
  // A selected or hovered concept always shows its name, even if that means sitting over a lower-priority label.
  const pick=free??(i.priority>=3?options[0]:undefined);
  if(!pick)continue;
  placed.push(pick[3]);out.push({id:i.id,text,x:pick[0],y:pick[1],anchor:pick[2]});
 }
 return out;
}
