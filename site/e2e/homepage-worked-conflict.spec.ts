import {test,expect} from "@playwright/test";

test("homepage scenario comparisons retain their demonstration boundary",async({page})=>{
 await page.goto("/");
 const section=page.locator("#product-demo");
 await expect(section).toContainText("Example investigation");
 await expect(section).toContainText("scenario data");
 await expect(section).toContainText("not independently validated");
 const choices=section.getByRole("tab");
 for(let i=0;i<await choices.count();i++){
  await choices.nth(i).click();
  await expect(section.getByRole("group",{name:"Conflict pair preview"})).toBeVisible();
  await expect(section).toContainText("What remains unresolved:");
  await expect(section.getByRole("link",{name:/Open this example/})).toHaveAttribute("href",/^\/demo\/universe\?scenario=/);
 }
});
