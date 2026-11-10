/**
 * Phase 9 coverage contract: four independently navigable, connected research
 * departments. This is a coverage registry, not a claim of completed ingestion.
 */
export type HsiScientificDepartment="immunology"|"microbiome"|"neurobiology"|"metabolism";
export type DepartmentCoverage={
  id:HsiScientificDepartment;
  title:string;
  existingEntryPath:string;
  coreConcepts:readonly string[];
  requiredEvidenceTypes:readonly string[];
  validationState:"coverage_requirements_defined";
};
export const HSI_SCIENTIFIC_DEPARTMENTS:readonly DepartmentCoverage[]=[
  {id:"immunology",title:"Immunology",
    existingEntryPath:"/modules/isi?domain=immunity&scenario=ssc_fibrosis",
    coreConcepts:["innate immunity","adaptive immunity","immune cells","cytokines","autoimmunity","cancer immunology","infection","transplantation"],
    requiredEvidenceTypes:["human immunophenotyping","functional assays","single-cell immune atlas","primary literature"],
    validationState:"coverage_requirements_defined"},
  {id:"microbiome",title:"Microbiome",
    existingEntryPath:"/research/knowledge-graph?domain=microbiome&scenario=gut_neuro",
    coreConcepts:["microbial taxonomy","microbial functions","metabolites","host-microbe interactions","gut microbiome","mucosal microbiome"],
    requiredEvidenceTypes:["metagenomics","metabolomics","microbial function studies","human cohort studies"],
    validationState:"coverage_requirements_defined"},
  {id:"neurobiology",title:"Neurobiology",
    existingEntryPath:"/science/graph?q=neuro",
    coreConcepts:["neurons","astrocytes","microglia","neuroinflammation","neural circuits","neurodegeneration","gut-brain axis"],
    requiredEvidenceTypes:["neural cell atlases","spatial transcriptomics","functional neuroscience","human neuropathology"],
    validationState:"coverage_requirements_defined"},
  {id:"metabolism",title:"Metabolism",
    existingEntryPath:"/science/body?domain=clinical&scenario=metabolic_inflammation",
    coreConcepts:["glucose homeostasis","lipid metabolism","insulin signalling","mitochondria","obesity","diabetes","immunometabolism"],
    requiredEvidenceTypes:["metabolomics","metabolic flux","human physiology","clinical biomarkers"],
    validationState:"coverage_requirements_defined"},
] as const;
export type CrossDepartmentScenario={
  id:string;departments:readonly HsiScientificDepartment[];
  researchQuestion:string;
  status:"proposed_validation_scenario";
};
export const CROSS_DEPARTMENT_SCENARIOS:readonly CrossDepartmentScenario[]=[
  {id:"gut-immune-brain-metabolic-axis",
    departments:["microbiome","immunology","neurobiology","metabolism"],
    researchQuestion:"What source-supported pathways could connect microbial metabolites, immune signalling, neuroinflammation and metabolic dysfunction, and where is evidence absent?",
    status:"proposed_validation_scenario"},
  {id:"immunometabolism",
    departments:["immunology","metabolism"],
    researchQuestion:"How do immune-cell metabolic states vary across inflammatory contexts and interventions?",
    status:"proposed_validation_scenario"},
  {id:"microglia-metabolite-signalling",
    departments:["microbiome","neurobiology","immunology"],
    researchQuestion:"Which observed microbial-metabolite and microglial responses have compatible tissue, species and experimental contexts?",
    status:"proposed_validation_scenario"},
] as const;
export function validateDepartmentCoverage(){
  const ids=HSI_SCIENTIFIC_DEPARTMENTS.map(x=>x.id);
  if(new Set(ids).size!==4)throw new Error("Expected four unique departments");
  const valid=new Set(ids);
  for(const department of HSI_SCIENTIFIC_DEPARTMENTS){
    if(!department.existingEntryPath.startsWith("/")||!department.coreConcepts.length||
      !department.requiredEvidenceTypes.length)
      throw new Error("Incomplete department coverage contract");
  }
  for(const scenario of CROSS_DEPARTMENT_SCENARIOS){
    if(new Set(scenario.departments).size<2||
      scenario.departments.some(id=>!valid.has(id)))
      throw new Error("Invalid cross-department scenario");
  }
  return {departments:ids.length,scenarios:CROSS_DEPARTMENT_SCENARIOS.length,
    scientificValidationComplete:false as const};
}
