/** Small, dependency-free statistics for the evaluation set. Seeded so the same ratings always give the same intervals. */
export function mulberry32(seed:number){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
export const mean=(xs:readonly number[])=>xs.length?xs.reduce((s,x)=>s+x,0)/xs.length:null;
const round=(x:number,d=3)=>Math.round(x*10**d)/10**d;
export type CI={n:number;mean:number;low:number;high:number};
/** Percentile bootstrap of the mean over units (items). Returns null for fewer than 2 units. */
export function bootstrapMeanCI(xs:readonly number[],seed=7,resamples=2000,level=.95):CI|null{
 const n=xs.length;if(n<2)return null;
 const rnd=mulberry32(seed),means:number[]=[];
 for(let r=0;r<resamples;r++){let s=0;for(let i=0;i<n;i++)s+=xs[Math.floor(rnd()*n)]!;means.push(s/n)}
 means.sort((a,b)=>a-b);const lo=Math.floor(((1-level)/2)*resamples),hi=Math.min(resamples-1,Math.ceil((1-(1-level)/2)*resamples)-1);
 return {n,mean:round(mean(xs)!),low:round(means[lo]!),high:round(means[hi]!)};
}
/** Paired differences (a minus b) per unit, with a bootstrap interval. */
export const pairedDiffCI=(a:readonly number[],b:readonly number[],seed=11,resamples=2000)=>a.length===b.length?bootstrapMeanCI(a.map((x,i)=>x-b[i]!),seed,resamples):null;
/** Quadratic-weighted Cohen's kappa for two raters on an ordinal 1..k scale. Null when undefined (no variation) or fewer than 2 pairs. */
export function weightedKappa(a:readonly number[],b:readonly number[],k=5):number|null{
 const n=a.length;if(n<2||b.length!==n)return null;
 const O=Array.from({length:k},()=>new Array<number>(k).fill(0)),ra=new Array<number>(k).fill(0),rb=new Array<number>(k).fill(0);
 for(let i=0;i<n;i++){const x=a[i]!-1,y=b[i]!-1;if(!(x>=0&&x<k&&y>=0&&y<k))return null;O[x]![y]!++;ra[x]!++;rb[y]!++}
 let po=0,pe=0;
 for(let i=0;i<k;i++)for(let j=0;j<k;j++){const w=1-((i-j)**2)/((k-1)**2);po+=w*O[i]![j]!/n;pe+=w*(ra[i]!*rb[j]!)/(n*n)}
 return pe>=1-1e-12?null:round((po-pe)/(1-pe));
}
export const percentAgreement=(a:readonly number[],b:readonly number[],tol=0)=>a.length&&a.length===b.length?round(a.filter((x,i)=>Math.abs(x-b[i]!)<=tol).length/a.length):null;
/** Plain-language reading of kappa. A label for orientation, not a pass mark. */
export const kappaLabel=(k:number|null)=>k===null?"not defined":k<0.2?"slight":k<0.4?"fair":k<0.6?"moderate":k<0.8?"substantial":"almost perfect";
