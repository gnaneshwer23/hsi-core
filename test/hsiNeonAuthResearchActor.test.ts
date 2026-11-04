import {test,expect} from "bun:test";
import {authenticateHsiNeonSession} from "../src/db/neonAuthResearchActor";
const invalidDatabaseUrl="postgresql://nobody:never-use@ep-unknown.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
test("HSI auth fails closed without a session token and never opens a database connection",async()=>{
 for(const token of [null,undefined,"","short","has whitespace and a length over sixteen"]) {
  expect(await authenticateHsiNeonSession({sessionToken:token,databaseUrl:invalidDatabaseUrl})).toBeNull();
 }
});
test("HSI auth refuses an arbitrary database endpoint before querying sessions",async()=>{
 await expect(authenticateHsiNeonSession({sessionToken:"a".repeat(32),databaseUrl:invalidDatabaseUrl})).rejects.toThrow("HSI database guard");
});
