import {describe,expect,it} from "bun:test";
import {assertHsiNeonDatabaseUrl} from "../src/db/neonGuard";
const url=(host:string)=>`postgresql://hsi:placeholder@${host}/neondb?sslmode=require`;
describe("HSI Neon environment isolation",()=>{
 it("accepts the verified HSI staging endpoint",()=>{
  expect(assertHsiNeonDatabaseUrl(url("ep-sweet-hill-zasb0lni.c-2.eu-west-2.aws.neon.tech"),{neonProjectId:"red-wave-06625195"}).ok).toBe(true);
 });
 it("rejects non-HSI project IDs even on staging host",()=>{
  expect(assertHsiNeonDatabaseUrl(url("ep-sweet-hill-zasb0lni.c-2.eu-west-2.aws.neon.tech"),{neonProjectId:"spring-wind-48457918"}).ok).toBe(false);
 });
 it("rejects arbitrary hosts and other products",()=>{
  expect(assertHsiNeonDatabaseUrl(url("ep-unknown.c-2.eu-west-2.aws.neon.tech")).ok).toBe(false);
  expect(assertHsiNeonDatabaseUrl(url("ep-blue-salad.c-7.us-east-2.aws.neon.tech")).ok).toBe(false);
 });
 it("requires TLS and neondb",()=>{
  expect(assertHsiNeonDatabaseUrl(url("ep-sweet-hill-zasb0lni.c-2.eu-west-2.aws.neon.tech").replace("sslmode=require","sslmode=disable")).ok).toBe(false);
  expect(assertHsiNeonDatabaseUrl(url("ep-sweet-hill-zasb0lni.c-2.eu-west-2.aws.neon.tech").replace("/neondb","/otherdb")).ok).toBe(false);
 });
});