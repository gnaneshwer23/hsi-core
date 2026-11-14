import {DEPARTMENT_TAGS} from "../../../src/knowledgeGraph/departments";
/** The six scientific departments. They are interconnected perspectives on one graph, not separate products or databases.
 * `graphConcepts` is the number of concepts in the PUBLIC research graph tagged to the area (candidates, unreviewed).
 * It is verified against research/domain-graph/graph.v1.json by test/departmentsSite.test.ts so it cannot drift. */
export type Department={
 slug:string;name:string;tagline:string;summary:string;
 explore:readonly string[];questions:readonly string[];
 connections:readonly {slug:string;why:string}[];
 graphTags:readonly string[];graphConcepts:number;
};
export const departments:readonly Department[]=Object.freeze([
 {slug:"immunology",name:"Immunology",tagline:"Cells, signalling and immune regulation.",
  summary:"Investigate immune-cell populations, cytokine networks, innate and adaptive immunity, autoimmunity, inflammatory pathways, tolerance and tissue-specific immune responses.",
  explore:["Cell states","Signalling","Inflammation","Immune regulation","Immunopathology"],
  questions:["Which cytokine signals recur across autoimmune conditions, and in which tissues do they act differently?","When two studies disagree about a T-cell subset, do species, tissue or assay explain the difference?","What distinguishes a protective inflammatory response from a pathological one in a given tissue?"],
  connections:[{slug:"neuroscience",why:"Immune signals reach glia and shape neuroinflammation."},{slug:"microbiome",why:"Microbial metabolites tune immune cells at barrier surfaces."},{slug:"metabolism",why:"Metabolic state changes how immune cells behave."}],
  graphTags:DEPARTMENT_TAGS["immunology"],graphConcepts:127},
 {slug:"neuroscience",name:"Neuroscience",tagline:"Neural systems and immune interactions.",
  summary:"Explore neurons, glial cells, neuroinflammation, neural circuits, neurodegeneration and the relationships between the nervous, immune and metabolic systems.",
  explore:["Neural circuits","Glia","Neuroimmune signalling","Brain–body interactions"],
  questions:["How do peripheral immune signals reach microglia, and which findings come only from animal models?","Which neuroinflammatory pathways are shared between neurodegenerative and metabolic conditions?","What evidence links gut-derived signals to brain outcomes, and how strong is it in humans?"],
  connections:[{slug:"immunology",why:"Microglia and infiltrating immune cells drive neuroinflammation."},{slug:"microbiome",why:"The gut–brain axis links microbial products to neural responses."},{slug:"human-physiology",why:"Brain–body regulation spans organs and homeostatic systems."}],
  graphTags:DEPARTMENT_TAGS["neuroscience"],graphConcepts:35},
 {slug:"microbiome",name:"Microbiome",tagline:"Microbial communities and host response.",
  summary:"Explore microbial taxa, community structure, microbial metabolites, barrier function and the interactions between microbes and host physiology.",
  explore:["Microbial ecology","Metabolites","Host response","Gut–immune interactions"],
  questions:["Which microbial metabolites are reported to modulate immune signalling, and in what host contexts?","Do reported taxa–disease associations hold across cohorts, sequencing methods and diets?","Where does the evidence link barrier changes to systemic inflammation?"],
  connections:[{slug:"immunology",why:"Metabolites such as short-chain fatty acids act on immune regulation."},{slug:"metabolism",why:"Microbes and host share metabolic pathways and products."},{slug:"neuroscience",why:"Gut-derived signals are studied for effects on the brain."}],
  graphTags:DEPARTMENT_TAGS["microbiome"],graphConcepts:38},
 {slug:"metabolism",name:"Metabolism",tagline:"Metabolic pathways and inflammation.",
  summary:"Explore energy regulation, insulin signalling, lipid metabolism, metabolic inflammation, endocrine regulation and the interactions between cellular metabolism and systemic disease.",
  explore:["Metabolites","Pathways","Mitochondria","Endocrine signals","Metabolic dysfunction"],
  questions:["How do metabolic pathways and inflammatory signalling influence each other in the same tissue?","Which reported metabolic biomarkers are context-specific rather than general?","How do insulin-signalling findings differ between model systems and human studies?"],
  connections:[{slug:"immunology",why:"Immunometabolism links cell state to energy use."},{slug:"microbiome",why:"Microbial metabolism feeds into host metabolic signalling."},{slug:"genomics-multi-omics",why:"Metabolomic and genetic data constrain pathway claims."}],
  graphTags:DEPARTMENT_TAGS["metabolism"],graphConcepts:47},
 {slug:"genomics-multi-omics",name:"Genomics & Multi-omics",tagline:"Molecular evidence across biological scales.",
  summary:"Connect genetic variation, gene expression, proteomics, metabolomics, epigenomics and single-cell evidence with biological pathways, phenotypes and diseases.",
  explore:["Variants","Expression","Proteomics","Single-cell","Multi-omics integration"],
  questions:["Which variants, expression changes and proteomic findings converge on the same pathway, and in which cell types?","When transcript and protein measurements disagree, what do the methods and tissues suggest?","How should single-cell evidence be compared with bulk measurements for the same question?"],
  connections:[{slug:"immunology",why:"Single-cell data resolve immune cell states."},{slug:"metabolism",why:"Metabolomics and genetics test pathway-level claims."},{slug:"human-physiology",why:"Tissue context decides what a molecular signal means."}],
  graphTags:DEPARTMENT_TAGS["genomics-multi-omics"],graphConcepts:0},
 {slug:"human-physiology",name:"Human Physiology",tagline:"Mechanisms across tissues and systems.",
  summary:"Understand how molecular and cellular events relate to organ function, tissue responses, homeostasis and the interactions between physiological systems.",
  explore:["Organs","Tissues","Homeostasis","System interactions"],
  questions:["How do cellular findings translate into organ-level function, and where is that link only hypothesised?","Which tissue-specific differences change how a mechanism should be interpreted?","How do the immune, endocrine and nervous systems interact in homeostasis and disease?"],
  connections:[{slug:"neuroscience",why:"Neural control coordinates organ function."},{slug:"genomics-multi-omics",why:"Molecular profiles are only interpretable in tissue context."},{slug:"immunology",why:"Immune activity is tissue-specific and shapes organ responses."}],
  graphTags:DEPARTMENT_TAGS["human-physiology"],graphConcepts:0},
]);
export const departmentBySlug=(slug:string)=>departments.find(d=>d.slug===slug);
export const departmentPath=(slug:string)=>"/departments/"+slug;
/** Maps the labels used on the home page to department slugs. */
export const DEPARTMENT_BY_LABEL:Readonly<Record<string,string>>=Object.freeze({"Immunology":"immunology","Neuroscience":"neuroscience","Microbiome":"microbiome","Metabolism":"metabolism","Genomics & multi-omics":"genomics-multi-omics","Human physiology":"human-physiology"});
