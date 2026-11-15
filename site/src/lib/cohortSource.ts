import {DEFAULT_SPEC,GENERATOR_NOTICE,generateCohort} from "../../../src/clinicalPlane/generator";
import type {PlanePatient} from "../../../src/clinicalPlane/phenotype";
export type CohortSource="dataset"|"generated";
export const SOURCES:{id:CohortSource;label:string;note:string}[]=[
 {id:"dataset",label:"Validation dataset (200 profiles)",note:"The repository's validation dataset: 10 profiles per condition, so small-group protection hides many results. Its values are not condition-consistent."},
 {id:"generated",label:`Generated cohort (${DEFAULT_SPEC.n.toLocaleString("en-GB")} profiles)`,note:`${GENERATOR_NOTICE} Seeded, so it is identical every time (seed ${DEFAULT_SPEC.seed}). Includes deliberate missing data.`},
];
let cached:PlanePatient[]|null=null;
/** Generated in the browser on first use; deterministic, so nothing is downloaded and nothing varies. */
export const generatedCohort=():PlanePatient[]=>cached??(cached=generateCohort(DEFAULT_SPEC));
