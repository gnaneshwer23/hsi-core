/** Structured scenario records (not React copy). Terms and identifiers choose what to search; they are not findings.
 * Open Targets ids are search inputs; the response disease name is shown so a wrong id is visible. */
import type {LiveScenario} from "./liveRun";
export const LIVE_SCENARIOS:Readonly<Record<string,LiveScenario>>=Object.freeze({
 "il21-autoimmune":{
 "schemaVersion": "hsi-live-scenario-1",
 "id": "il21-autoimmune",
 "title": "IL-21 across autoimmune diseases",
 "question": "Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?",
 "entities": [
  {
   "key": "il21",
   "label": "IL-21",
   "terms": [
    "IL-21",
    "interleukin-21",
    "interleukin 21"
   ]
  },
  {
   "key": "il21r",
   "label": "IL-21 receptor",
   "terms": [
    "IL-21R",
    "IL21R",
    "IL-21 receptor"
   ]
  },
  {
   "key": "tfh",
   "label": "T follicular helper cells",
   "terms": [
    "Tfh",
    "T follicular helper",
    "follicular helper T"
   ]
  },
  {
   "key": "bcell",
   "label": "B-cell responses",
   "terms": [
    "B cell",
    "B-cell",
    "plasma cell",
    "autoantibody"
   ]
  },
  {
   "key": "stat3",
   "label": "STAT3 signalling",
   "terms": [
    "STAT3",
    "JAK/STAT",
    "JAK-STAT"
   ]
  },
  {
   "key": "fibrosis",
   "label": "Fibroblast activation and fibrosis",
   "terms": [
    "fibrosis",
    "fibroblast",
    "collagen"
   ]
  }
 ],
 "relations": [
  {
   "id": "il21-tfh",
   "subject": "il21",
   "object": "tfh"
  },
  {
   "id": "il21-bcell",
   "subject": "il21",
   "object": "bcell"
  },
  {
   "id": "il21-stat3",
   "subject": "il21",
   "object": "stat3"
  },
  {
   "id": "il21-fibrosis",
   "subject": "il21",
   "object": "fibrosis"
  }
 ],
 "contexts": [
  {
   "key": "ra",
   "label": "Rheumatoid arthritis",
   "terms": [
    "rheumatoid arthritis"
   ],
   "openTargetsId": "MONDO_0008383"
  },
  {
   "key": "sle",
   "label": "Systemic lupus erythematosus",
   "terms": [
    "systemic lupus erythematosus",
    "lupus"
   ],
   "openTargetsId": "MONDO_0007915"
  },
  {
   "key": "ssc",
   "label": "Systemic sclerosis",
   "terms": [
    "systemic sclerosis",
    "scleroderma"
   ],
   "openTargetsId": "MONDO_0005100"
  }
 ]
} as LiveScenario
});

const esc=(x:string)=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const mentions=(text:string,terms:readonly string[])=>terms.some(t=>new RegExp("(^|[^A-Za-z0-9])"+esc(t)+"($|[^A-Za-z0-9])","i").test(text));
/** Live runs cover curated scenarios only. A question matches when it names the scenario's lead entity and one of its disease contexts. */
export function matchScenario(query:string):string|null{
 for(const s of Object.values(LIVE_SCENARIOS)){
  const lead=s.entities.find(e=>e.key===s.relations[0]?.subject);
  if(lead&&mentions(query,lead.terms)&&(s.contexts.some(c=>mentions(query,c.terms))||/autoimmun/i.test(query)))return s.id;
 }
 return null;
}
