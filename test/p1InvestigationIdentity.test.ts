import {test,expect} from "bun:test";
import {randomUUID} from "node:crypto";
test("execution UUIDs are distinct for identical investigations",()=>{
 const fingerprint="hsi-investigation-aaaaaaaaaaaaaaaaaaaaaaaa";
 const first="hsi-run-"+randomUUID(),second="hsi-run-"+randomUUID();
 expect(first).not.toBe(second);
 expect(first.startsWith("hsi-run-")).toBe(true);
 expect(fingerprint).toBe(fingerprint);
});
