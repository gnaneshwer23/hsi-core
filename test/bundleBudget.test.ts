import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {evaluateBudget,type Budget,type Measured} from "../site/scripts/check-bundle-budget";

const budget=JSON.parse(readFileSync("site/bundle-budget.json","utf8")) as Budget;
const ok:Measured={entryJs:"index-x.js",entryJsGzip:budget.entryJsGzipBytes,totalCssGzip:budget.totalCssGzipBytes,largestLazy:{file:"chunk.js",gzip:budget.largestLazyChunkGzipBytes}};

test("a build exactly at the budget passes",()=>{expect(evaluateBudget(ok,budget)).toEqual([])});
test("each limit fails independently with a message naming the file or asset",()=>{
 expect(evaluateBudget({...ok,entryJsGzip:budget.entryJsGzipBytes+1},budget).join()).toContain("Entry script index-x.js");
 expect(evaluateBudget({...ok,totalCssGzip:budget.totalCssGzipBytes+1},budget).join()).toContain("Total CSS");
 expect(evaluateBudget({...ok,largestLazy:{file:"big.js",gzip:budget.largestLazyChunkGzipBytes+1}},budget).join()).toContain("Lazy chunk big.js");
});
test("the committed budget is positive and not absurdly loose",()=>{
 for(const v of Object.values({entry:budget.entryJsGzipBytes,css:budget.totalCssGzipBytes,lazy:budget.largestLazyChunkGzipBytes}))expect(v).toBeGreaterThan(10_000);
 expect(budget.entryJsGzipBytes).toBeLessThanOrEqual(260_000);
});
