export const EXPERIENCE_DOMAINS=[
 {id:"immune",label:"Immune system",short:"Immunity",description:"Explore cells, signalling and disease mechanisms with the study context kept in view.",colour:"#17645f",to:"/research",x:150,y:125},
 {id:"evidence",label:"Scientific evidence",short:"Evidence",description:"Inspect source identity, passages, uncertainty and review state before relying on a claim.",colour:"#52697e",to:"/evidence-safety",x:420,y:65},
 {id:"metabolic",label:"Metabolism",short:"Metabolism",description:"Explore glucose, lipid and metabolic context in clearly labelled validation scenarios.",colour:"#9d5a20",to:"/solutions",x:650,y:155},
 {id:"gut",label:"Gut microbiome",short:"Microbiome",description:"See how microbial observations and immune context are organised, without assuming a causal link.",colour:"#44765b",to:"/science",x:160,y:370},
 {id:"brain",label:"Brain health",short:"Brain",description:"Explore educational neurological context and distinguish it from patient-specific interpretation.",colour:"#776099",to:"/science",x:610,y:385},
 {id:"trials",label:"Clinical research",short:"Trials",description:"Inspect trial topic overlap and missing criteria. Investigators retain eligibility decisions.",colour:"#526199",to:"/for-trials",x:400,y:470},
] as const;
export const EXPERIENCE_STEPS=[
 {title:"Ask a research question",short:"Question",detail:"Define the question and intended research scope. Keep personal identifiers and clinical records out of the research plane.",output:"A bounded investigation plan",to:"/research/dashboard"},
 {title:"Connect the context",short:"Context",detail:"Keep source versions, biological context and permitted uses attached to the investigation. Synthetic profiles remain clearly labelled test inputs.",output:"A source-bound context",to:"/research/validation"},
 {title:"Explore the relationships",short:"Graph",detail:"Follow represented entities and relationships. Inspect every edge before treating it as relevant evidence; a path is not proof of causality.",output:"An inspectable mechanism or context map",to:"/science/graph"},
 {title:"Inspect the evidence",short:"Evidence",detail:"Compare source passages, study models, opposing observations and gaps. Citation integrity and scientific relevance are separate checks.",output:"A visible evidence trail",to:"/research/evidence-readiness"},
 {title:"Keep review independent",short:"Review",detail:"An authorised independent reviewer records a scoped decision. Accepting a brief does not publish graph knowledge or approve a clinical action.",output:"A recorded review decision",to:"/research/scientific-review"},
 {title:"Take the work with you",short:"Brief",detail:"Export the bound record, sources, uncertainty and review scope. Incomplete experiments, trials or searches stay explicit.",output:"A reproducible research brief",to:"/research/dashboard?view=briefs"},
] as const;
export const EXPERIENCE_MODULES=[
 {title:"Research workbench",tag:"Access controlled",detail:"Save a bounded question, inspect its evidence and prepare a source-bound brief.",to:"/research"},
 {title:"Biological knowledge graph",tag:"Research & education",detail:"Explore typed relationships and their context, sources and review state.",to:"/science/graph"},
 {title:"Evidence intelligence",tag:"Source foundation",detail:"Inspect a versioned working catalogue and the limits of each candidate claim.",to:"/evidence-safety"},
 {title:"Health-data context",tag:"Validation experience",detail:"Explore 200 generated profiles across 20 conditions, with five-visit observations.",to:"/research/validation"},
 {title:"Trial intelligence",tag:"Research preview",detail:"Inspect topic overlap and missing screening information; no enrolment decisions.",to:"/for-trials"},
 {title:"Clinical intelligence",tag:"Separate programme",detail:"Authorised clinical workflows belong to their own product and data governance.",to:"/for-aksh"},
] as const;
export const EVIDENCE_STATES=[
 {id:"supported",label:"Supported",meaning:"Direct evidence supports the scoped claim. Study context and independent review still matter.",tone:"green"},
 {id:"context_limited",label:"Context-limited",meaning:"Interpretation is limited to the documented species, tissue, study setting or population.",tone:"amber"},
 {id:"contested",label:"Contested",meaning:"Relevant evidence disagrees; study context and competing findings must remain visible.",tone:"red"},
 {id:"not_curated",label:"Not curated",meaning:"The evidence has not completed scientific review. Presence in a catalogue is not approval.",tone:"slate"},
 {id:"ai_draft",label:"AI draft",meaning:"A proposed explanation, not established knowledge. It needs evidence mapping and human review.",tone:"violet"},
 {id:"synthetic",label:"Synthetic",meaning:"Generated software-validation data. It cannot establish scientific support or trial eligibility.",tone:"slate"},
] as const;
export const EXPERIENCE_PAGE_META:Record<string,{title:string;description:string}>={
 "/":{title:"Human Super Intelligence — Connected evidence. Clearer research.",description:"Explore biological context, source-linked evidence and accountable human review in the Human Super Intelligence research ecosystem."},
 "/research":{title:"Research — Human Super Intelligence",description:"A connected research journey from a bounded question to inspectable evidence, independent review and a reproducible brief."},
 "/solutions":{title:"Solutions — Human Super Intelligence",description:"Explore HSI workflows for translational researchers, discovery teams and product partners, with clear research and clinical boundaries."},
 "/evidence-safety":{title:"Evidence & safety — Human Super Intelligence",description:"Understand evidence status, provenance, context, uncertainty and independent review in HSI."},
 "/community":{title:"Community — Human Super Intelligence",description:"Explore evidence-led research discussion themes and prepare local discussion drafts. Public posting is not enabled."},
 "/pricing":{title:"Access & pilots — Human Super Intelligence",description:"Choose public exploration, authorised research access or a proposed team pilot. No paid plans or checkout are currently published."},
 "/contact":{title:"Request access — Human Super Intelligence",description:"Create an HSI account, understand research permissions and prepare a scoped research collaboration brief."},
 "/platform":{title:"Platform — Human Super Intelligence",description:"Explore shared research technology across separately governed products, source context and human review."},
 "/technology":{title:"Technology — Human Super Intelligence",description:"Inspect the source, graph, investigation and review foundations behind HSI's research experience."},
 "/products":{title:"Products — Human Super Intelligence",description:"Meet Aksh Health, ISI Research, HSI Clinical and HSI Trials, with clear product scope and maturity."},
 "/science":{title:"Science — Human Super Intelligence",description:"Explore educational biological context, organ systems and draft relationships separately from approved research findings."},
 "/how-it-works":{title:"How it works — Human Super Intelligence",description:"Follow HSI's question, context, graph, evidence, independent review and brief workflows."},
 "/research/dashboard":{title:"Research dashboard — Human Super Intelligence",description:"Create and reopen authorised investigations, inspect evidence and access independent review."}
};
