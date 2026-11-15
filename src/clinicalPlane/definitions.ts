import type {PhenotypeDefinition} from "./phenotype";
/** Illustrative synthetic phenotype, authored by a person for the demonstration. Not validated, not a clinical definition. Linked to a graph gap by reference only. */
export const diabetesGlycaemicResponse=(graphVersion:string):PhenotypeDefinition=>({
 schema:"hsi-phenotype-definition-1",id:"phenotype:t2d-glycaemic-response-illustrative",title:"Type 2 diabetes with latest HbA1c at or above 7.0%, adults, not on a GLP-1 receptor agonist",
 origin:{kind:"graph_gap",ref:"gap:human-butyrate-diabetes",graphVersion},
 include:[{kind:"condition",equals:"Type 2 diabetes"},{kind:"age",min:18},{kind:"lab",test:"HbA1c",op:">=",value:7,at:"latest"}],
 exclude:[{kind:"medication",includes:"GLP-1 receptor agonist"}],
 summariseLabs:["HbA1c","hs-CRP"],
 note:"Illustrative definition on synthetic profiles only."
});
/** Broader illustrative phenotype across conditions, used where the synthetic profiles give enough matches to pass small-cell rules. */
export const raisedHbA1cAdults=(graphVersion:string):PhenotypeDefinition=>({
 schema:"hsi-phenotype-definition-1",id:"phenotype:raised-hba1c-adults-illustrative",title:"Adults with latest HbA1c at or above 7.0%, not on a GLP-1 receptor agonist",
 origin:{kind:"graph_gap",ref:"gap:human-butyrate-diabetes",graphVersion},
 include:[{kind:"age",min:18},{kind:"lab",test:"HbA1c",op:">=",value:7,at:"latest"}],
 exclude:[{kind:"medication",includes:"GLP-1 receptor agonist"}],
 summariseLabs:["HbA1c","hs-CRP"],
 note:"Illustrative definition on synthetic profiles only; spans conditions."
});
