/** Append-only, hash-chained audit log for the clinical plane (21 CFR Part 11 / ALCOA+ posture: attributable, contemporaneous, tamper-evident). Pure and immutable: append returns a new log. */
import {sha256Hex} from "./sha256";
export type AuditEntry={seq:number;at:string;actor:string;action:string;subject:string;detail:string;prevHash:string;hash:string};
export type AuditLog={readonly entries:readonly AuditEntry[]};
export const GENESIS="0".repeat(64);
export const canonical=(v:unknown):string=>Array.isArray(v)?"["+v.map(canonical).join(",")+"]":v&&typeof v==="object"?"{"+Object.keys(v as object).sort().map(k=>JSON.stringify(k)+":"+canonical((v as Record<string,unknown>)[k])).join(",")+"}":JSON.stringify(v);
export const sha256=(v:unknown)=>sha256Hex(typeof v==="string"?v:canonical(v));
const body=(e:Omit<AuditEntry,"hash">)=>sha256({seq:e.seq,at:e.at,actor:e.actor,action:e.action,subject:e.subject,detail:e.detail,prevHash:e.prevHash});
export const emptyAudit=():AuditLog=>({entries:[]});
export function appendAudit(log:AuditLog,e:{at:string;actor:string;action:string;subject:string;detail:string}):AuditLog{
 const prev=log.entries.at(-1),partial={seq:(prev?.seq??0)+1,at:e.at,actor:e.actor.slice(0,120),action:e.action.slice(0,80),subject:e.subject.slice(0,200),detail:e.detail.slice(0,500),prevHash:prev?.hash??GENESIS};
 return {entries:[...log.entries,{...partial,hash:body(partial)}]};
}
/** Returns the first broken sequence number, or null when the whole chain verifies. */
export function verifyAudit(log:AuditLog):number|null{
 let prev=GENESIS;
 for(const [i,e] of log.entries.entries()){
  if(e.seq!==i+1||e.prevHash!==prev||e.hash!==body(e))return e.seq;
  prev=e.hash;
 }
 return null;
}
