/** The wider HSI vision, described by capability. No product names: these are capabilities of one platform under separate
 * governance, each with an honest maturity label. Nothing here is a claim that a capability is available today. */
export type CapabilityStatus="research_preview"|"in_development"|"planned";
export const STATUS_TEXT:Readonly<Record<CapabilityStatus,string>>=Object.freeze({research_preview:"Research preview",in_development:"In development",planned:"Planned"});
export type ConnectedCapability={id:string;title:string;summary:string;connects:readonly string[];status:CapabilityStatus;today:string;isNot:string;governance:string};
export const connectedCapabilities:readonly ConnectedCapability[]=Object.freeze([
 {id:"scientific-discovery",title:"Scientific discovery",
  summary:"Investigate biological mechanisms across the six departments, compare evidence in its biological and experimental context, and see where findings agree, differ or remain uncertain.",
  connects:["Biological knowledge graph","Source evidence and provenance","Context and contradiction analysis","Research gaps and hypotheses"],
  status:"research_preview",today:"A public research graph of candidate concepts, an evidence-context audit demonstration and an illustrative research brief.",
  isNot:"Not validated discovery. Candidate relationships are unreviewed and are not clinical advice.",
  governance:"Evidence, interpretation, independent verification and graph publication are separate decisions."},
 {id:"clinical-context",title:"Longitudinal clinical context",
  summary:"Bring authorised clinical information into a single timeline of conditions, laboratory trends and medications, so that care and research teams can see change over time.",
  connects:["Identity-verified clinical records","Laboratory and medication timelines","Clinical summaries for authorised teams"],
  status:"in_development",today:"Design and governance work only. This website and the public research graph handle no patient data.",
  isNot:"Not clinical decision support and not a live hospital integration.",
  governance:"Requires identity verification, consent, privacy review, regulatory assessment and clinical validation before any use."},
 {id:"patient-context",title:"Patient-reported health context",
  summary:"Capture patient-reported symptoms, medications and health measures, with a focus on metabolic and cardiometabolic health, so that lived experience sits alongside clinical and scientific evidence.",
  connects:["Symptoms and outcomes reported by patients","Medication and metabolic health context","Optional device-derived measures"],
  status:"in_development",today:"Developed separately from this research preview, with its own privacy and governance boundaries.",
  isNot:"Not a diagnostic or treatment service, and not part of the public research graph.",
  governance:"Participation and sharing are explicit, permissioned and revocable; patient data is never pooled into the scientific graph."},
 {id:"translational-studies",title:"Translational study intelligence",
  summary:"Connect disease biology, biomarkers and published study criteria so that researchers can explore which trials and study questions relate to a mechanism.",
  connects:["Disease biology and biomarkers","Published study criteria","Exploratory prescreening logic"],
  status:"planned",today:"Planned. No live matching and no enrolment are offered.",
  isNot:"Exploratory prescreening is not confirmed eligibility, which needs current study information and a qualified clinical assessment.",
  governance:"Investigator confirmation is always required; no patient is matched or contacted by this website."},
]);
export const GOVERNANCE_PRINCIPLES:readonly {title:string;text:string}[]=Object.freeze([
 {title:"One foundation, separate data",text:"The scientific knowledge graph is distinct from restricted patient and clinical records. Connected intelligence does not mean all information sits in one unrestricted database."},
 {title:"Connections are permissioned",text:"Any link between scientific evidence and personal or clinical information happens only through explicit, authorised, audited integration for a stated purpose."},
 {title:"Nothing here handles patient data",text:"This website and the public research graph contain no patient-level information."},
 {title:"Maturity is stated, not implied",text:"Each capability carries a label. A name or a diagram is not evidence that something is available or validated."},
]);
