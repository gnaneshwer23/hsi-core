import {useEffect,useState} from "react";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {loadDomainGraph} from "./claimGraphClient";

let pending:Promise<DomainBundle>|null=null;
/** One verified snapshot request shared by every component on the page. A failure clears the cache so a later mount can retry. */
function fetchOnce(){
 if(!pending){const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);pending=loadDomainGraph(null,c.signal).finally(()=>clearTimeout(t));pending.catch(()=>{pending=null})}
 return pending;
}
export function useSharedBundle(){
 const [bundle,setBundle]=useState<DomainBundle|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let live=true;fetchOnce().then(b=>{if(live)setBundle(b)}).catch(()=>{if(live)setFailed(true)});return()=>{live=false}},[]);
 return {bundle,failed};
}
