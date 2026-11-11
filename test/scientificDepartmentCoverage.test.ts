import {describe,expect,test} from "bun:test";
import {HSI_SCIENTIFIC_DEPARTMENTS,CROSS_DEPARTMENT_SCENARIOS,validateDepartmentCoverage}
  from "../src/evidence/scientificDepartmentCoverage";
describe("Phase 9 four-department coverage contract",()=>{
  test("includes all four departments with distinct entry routes",()=>{
    expect(HSI_SCIENTIFIC_DEPARTMENTS.map(x=>x.id).sort()).toEqual(
      ["immunology","metabolism","microbiome","neurobiology"]);
    expect(new Set(HSI_SCIENTIFIC_DEPARTMENTS.map(x=>x.existingEntryPath)).size).toBe(4);
  });
  test("cross-domain scenarios reference known departments",()=>{
    expect(validateDepartmentCoverage()).toEqual({
      departments:4,scenarios:3,scientificValidationComplete:false,
    });
    expect(CROSS_DEPARTMENT_SCENARIOS.some(s=>s.departments.length===4)).toBe(true);
  });
  test("coverage definitions do not claim scientific validation",()=>{
    expect(HSI_SCIENTIFIC_DEPARTMENTS.every(
      d=>d.validationState==="coverage_requirements_defined")).toBe(true);
    expect(CROSS_DEPARTMENT_SCENARIOS.every(
      s=>s.status==="proposed_validation_scenario")).toBe(true);
  });
});
