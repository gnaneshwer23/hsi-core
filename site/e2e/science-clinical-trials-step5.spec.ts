import {test,expect} from "@playwright/test";
import {SYNTHETIC_OBSERVATIONS,SYNTHETIC_TRIALS,prescreenSyntheticTrial,validateSyntheticBridge} from "../src/features/science/clinicalTrialBridge";
test("synthetic trial bridge compares known values but preserves missing evidence",()=>{
 expect(validateSyntheticBridge(SYNTHETIC_OBSERVATIONS,SYNTHETIC_TRIALS)).toEqual([]);
 const result=prescreenSyntheticTrial(SYNTHETIC_TRIALS[0]!,SYNTHETIC_OBSERVATIONS,"synthetic-case-001");
 expect(result.results[0]?.state).toBe("potentially_met");
 expect(result.results[1]?.state).toBe("unknown");
 expect(result.state).toBe("insufficient_data");
 expect(prescreenSyntheticTrial(SYNTHETIC_TRIALS[0]!,[], "synthetic-case-001").results.every(r=>r.state==="unknown")).toBe(true);
});
test("invalid synthetic source or real identifiers cannot enter public fixture",()=>{
 expect(validateSyntheticBridge([{...SYNTHETIC_OBSERVATIONS[0]!,syntheticCaseId:"real-patient-123"}],SYNTHETIC_TRIALS)).toContain("Invalid synthetic observation obs-a1");
});
test("public clinical trial page labels all records synthetic",async({page})=>{
 await page.goto("/science/clinical-trials");
 await expect(page.getByRole("heading",{name:"Clinical and trial connections"})).toBeVisible();
 await expect(page.getByText("Synthetic case 001")).toBeVisible();
 await expect(page.getByText(/Not registered on ClinicalTrials.gov/)).toBeVisible();
 await expect(page.getByText(/insufficient data/i)).toBeVisible();
});
