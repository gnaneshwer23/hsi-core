import {test,expect} from "@playwright/test";
import {SCIENCE_GRAPH,validateGraph,getGraphNeighbourhood} from "../src/features/science/knowledgeGraph";
test("knowledge graph integrity and neighbourhood",()=>{
 expect(validateGraph()).toEqual([]);
 expect(SCIENCE_GRAPH.reviewed).toBe(false);
 expect(getGraphNeighbourhood("pancreas").nodes.length).toBeGreaterThan(1);
 expect(SCIENCE_GRAPH.edges.every(e=>e.reviewState==="draft")).toBe(true);
});
test("knowledge graph selection, search and evidence",async({page})=>{
 await page.goto("/science/graph?node=pancreas");
 await expect(page.getByRole("heading",{name:"Scientific knowledge graph"})).toBeVisible();
 await page.getByRole("group",{name:"Choose graph entity"}).getByRole("button",{name:/Liver/}).click();
 await expect(page).toHaveURL(/node=liver/);
 await expect(page.getByText(/definition:liver/)).toBeVisible();
 await page.getByRole("searchbox",{name:"Search"}).fill("unlikely-entity");
 await expect(page.getByRole("group",{name:"Choose graph entity"}).getByRole("button")).toHaveCount(0);
});
