/** Phase 3 curated educational mechanisms, not clinical guidance or a reviewed causal graph. */
export type MechanismStep={id:string;label:string;description:string;category:"context"|"cell"|"pathway"|"phenotype";sourceUrl:string;sourceTitle:string;reviewState:"draft"};
export type DiseaseJourney={id:string;name:string;subtitle:string;summary:string;systems:string[];steps:MechanismStep[];limitations:string};
const ref={diabetes:{url:"https://www.ncbi.nlm.nih.gov/books/NBK279144/",title:"NCBI Bookshelf — endocrine physiology"},ssc:{url:"https://www.ncbi.nlm.nih.gov/books/NBK430875/",title:"NCBI Bookshelf — systemic sclerosis"}};
const step=(id:string,label:string,description:string,category:MechanismStep["category"],source:{url:string;title:string}):MechanismStep=>({id,label,description,category,sourceUrl:source.url,sourceTitle:source.title,reviewState:"draft"});
export const DISEASE_JOURNEYS:DiseaseJourney[]=[
 {id:"type-2-diabetes",name:"Type 2 diabetes",subtitle:"Metabolic and endocrine mechanisms",summary:"Explore a simplified pathway connecting insulin action, beta-cell compensation and dysregulated glucose homeostasis.",systems:["Endocrine","Metabolic","Liver","Skeletal muscle"],limitations:"This simplified sequence is not a universal progression model. Individual mechanisms vary, and this page provides no diagnosis or treatment recommendation.",steps:[
 step("metabolic-context","Metabolic context","Glucose homeostasis depends on coordinated insulin secretion, insulin action and hepatic glucose production.","context",ref.diabetes),
 step("insulin-resistance","Reduced insulin sensitivity","Reduced insulin responsiveness in tissues such as muscle and liver can contribute to elevated glucose levels.","pathway",ref.diabetes),
 step("beta-cell-response","Beta-cell compensation","Pancreatic beta cells may initially increase insulin secretion in response to metabolic demand.","cell",ref.diabetes),
 step("glucose-dysregulation","Glucose dysregulation","When insulin secretion is insufficient relative to insulin demand, hyperglycaemia may develop.","phenotype",ref.diabetes)
 ]},
 {id:"systemic-sclerosis",name:"Systemic sclerosis",subtitle:"Immune, vascular and fibrotic biology",summary:"A researcher-oriented introduction to interacting vascular, immune and fibroblast processes in systemic sclerosis.",systems:["Immune","Vascular","Connective tissue"],limitations:"Systemic sclerosis is heterogeneous. These are co-occurring biological themes, not a proven linear causal chain. Molecular mechanisms and biomarkers require context-specific review.",steps:[
 step("vascular","Vascular dysfunction","Vascular injury and dysfunction are important features of systemic sclerosis and can interact with immune processes.","context",ref.ssc),
 step("immune","Immune dysregulation","Immune activation and autoantibody responses are associated with systemic sclerosis; their roles vary by disease context.","cell",ref.ssc),
 step("fibroblast","Fibroblast activation","Activated fibroblasts and altered extracellular-matrix regulation contribute to fibrotic tissue remodelling.","pathway",ref.ssc),
 step("fibrosis","Tissue fibrosis","Fibrosis may affect skin and internal organs, with substantial differences between individuals.","phenotype",ref.ssc)
 ]}
];
export const getDiseaseJourney=(id:string)=>DISEASE_JOURNEYS.find(j=>j.id===id);
export function validateDiseaseJourneys():string[]{const errors:string[]=[];const ids=new Set<string>();for(const j of DISEASE_JOURNEYS){if(ids.has(j.id))errors.push("Duplicate disease "+j.id);ids.add(j.id);const steps=new Set<string>();for(const s of j.steps){if(steps.has(s.id))errors.push("Duplicate step "+s.id);steps.add(s.id);if(!s.sourceUrl.startsWith("https://")||!s.sourceTitle||s.reviewState!=="draft")errors.push("Unreviewed or unsourced step "+s.id)}}return errors}
