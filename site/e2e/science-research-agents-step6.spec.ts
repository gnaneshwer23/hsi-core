import {test,expect} from "@playwright/test";
import {runResearchInvestigation} from "../src/features/science/researchOrchestrator";
test("research workstreams do not promote claims or invent hypotheses",()=>{
 const report=runResearchInvestigation("pancreas diabetes");
 expect(report.mode).toBe("deterministic_local_analysis");
 expect(report.reviewStatus).toBe("draft");
 expect(report.workItems).toHaveLength(5);
 expect(report.hypotheses).toEqual([]);
 expect(report.workItems.find(w=>w.role==="hypothesis_investigator")?.status).toBe("blocked");
 expect(()=>runResearchInvestigation(" ")).toThrow();
});
test("research workbench exposes review boundaries",async({page})=>{
 await page.goto("/science/research-agents");
 await expect(page.getByRole("heading",{name:"Research intelligence workbench"})).toBeVisible();
 await page.getByRole("button",{name:"Analyse existing graph"}).click();
 await expect(page.getByRole("region",{name:"Research investigation report"})).toBeVisible();
 await expect(page.getByText(/not connected autonomous AI agents/)).toBeVisible();
 await expect(page.getByText(/No hypotheses generated/)).toBeVisible();
});
