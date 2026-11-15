/** Appearance preference for the researcher app: light by default, optional dark, and an accent colour. Stored on this device only. */
export const THEMES=["light","dark"] as const;
export const ACCENTS:{id:string;label:string;swatch:string}[]=[{id:"violet",label:"Violet",swatch:"#6753a1"},{id:"teal",label:"Teal",swatch:"#0f766e"},{id:"blue",label:"Blue",swatch:"#2563eb"},{id:"rose",label:"Rose",swatch:"#be123c"},{id:"slate",label:"Slate",swatch:"#334155"}];
export type Appearance={theme:"light"|"dark";accent:string};
export const DEFAULT_APPEARANCE:Appearance={theme:"light",accent:"violet"};
export const APPEARANCE_KEY="hsi-appearance-v1";
export function parseAppearance(raw:string|null):Appearance{
 if(!raw)return {...DEFAULT_APPEARANCE};
 try{const x=JSON.parse(raw);return {theme:x?.theme==="dark"?"dark":"light",accent:ACCENTS.some(a=>a.id===x?.accent)?x.accent:"violet"}}catch{return {...DEFAULT_APPEARANCE}}
}
export const loadAppearance=():Appearance=>{try{return parseAppearance(typeof localStorage==="undefined"?null:localStorage.getItem(APPEARANCE_KEY))}catch{return {...DEFAULT_APPEARANCE}}};
export const saveAppearance=(a:Appearance)=>{try{localStorage.setItem(APPEARANCE_KEY,JSON.stringify(a));return true}catch{return false}};
