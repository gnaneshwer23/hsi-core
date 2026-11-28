import {expect,test} from "bun:test";
import {placeLabels,labelText,type LabelInput} from "../src/graphWorkspace/labels";

const at=(id:string,x:number,y:number,degree=5,priority=0,label=id):LabelInput=>({id,label,x,y,r:6,degree,priority});
const boxes=(k:number,ls:ReturnType<typeof placeLabels>)=>ls.map(l=>{const w=l.text.length*11/k*.56,h=11/k*1.25;const x0=l.anchor==="middle"?l.x-w/2:l.anchor==="start"?l.x:l.x-w;return {x0,x1:x0+w,y0:l.y-11/k,y1:l.y-11/k+h}});
const overlaps=(b:{x0:number;x1:number;y0:number;y1:number}[])=>b.some((a,i)=>b.some((c,j)=>j>i&&a.x0<c.x1&&c.x0<a.x1&&a.y0<c.y1&&c.y0<a.y1));

test("crowded labels never overlap, and the most connected concept wins",()=>{
 const crowd=Array.from({length:12},(_,i)=>at(`n${i}`,500+i*3,300+i*2,i+2,0,"Colonic mucosal Foxp3 Treg cell"));
 const ls=placeLabels(crowd,1,2);
 expect(ls.length).toBeGreaterThan(0);expect(ls.length).toBeLessThan(12);
 expect(ls[0]!.id).toBe("n11");
 expect(overlaps(boxes(1,ls))).toBe(false);
});
test("zooming in makes room for more labels",()=>{
 const crowd=Array.from({length:12},(_,i)=>at(`n${i}`,500+i*12,300+(i%3)*10,5,0,"Anti-TNF treatment response"));
 expect(placeLabels(crowd,3,1).length).toBeGreaterThan(placeLabels(crowd,1,1).length);
});
test("a selected or hovered concept always shows its name; low-degree concepts wait for zoom",()=>{
 const ls=placeLabels([at("hub",500,300,20),at("sel",501,301,1,4)],1,2);
 expect(ls.map(l=>l.id)).toContain("sel");
 expect(placeLabels([at("leaf",100,100,1)],1,2)).toEqual([]);
 expect(labelText("x".repeat(40)).length).toBe(28);
});
