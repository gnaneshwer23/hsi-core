import {describe,expect,test} from 'bun:test';
import {mapConcepts,nameVariants,type TermTable} from '../src/ontology/conceptMapping';

const term=(id:string,label:string,synonyms:string[]=[],obsolete=false)=>({id,label,synonyms,obsolete,definition:null} as any);
const tables:TermTable[]=[
 {prefix:'CL',release:'v1',terms:[term('CL:0002038','T follicular helper cell'),term('CL:0000236','B cell')]},
 {prefix:'UBERON',release:'v1',terms:[term('UBERON:0002106','spleen'),term('UBERON:0000120','blood brain barrier',['blood-brain barrier'])]},
 {prefix:'MONDO',release:'v1',terms:[term('MONDO:0000001','spleen')]},
];
const c=(id:string,name:string)=>({id,name});

describe('scoped and variant concept matching',()=>{
 test('default options behave exactly as before: exact only, searched everywhere',()=>{
  const [a,b]=mapConcepts([c('1','T follicular helper (Tfh) cells'),c('2','B cell')],tables);
  expect(a!.status).toBe('unmapped');expect(b!.candidates.map(x=>x.id)).toEqual(['CL:0000236']);expect(b!.candidates[0]!.matchedOn).toBe('label');
 });
 test('variants find a name that differs only by a parenthetical or "cells", and say so',()=>{
  const [m]=mapConcepts([c('1','T follicular helper (Tfh) cells')],tables,{variants:true});
  expect(m!.status).toBe('candidate');expect(m!.candidates[0]).toMatchObject({id:'CL:0002038',matchedOn:'variant_label'});
  expect(m!.reviewStatus).toBe('unreviewed');expect(m!.exactMappingApproved).toBe(false);
 });
 test('a variant is used only when there is no exact match',()=>{
  const [m]=mapConcepts([c('1','B cell')],tables,{variants:true});
  expect(m!.candidates.map(x=>x.matchedOn)).toEqual(['label']);
 });
 test('scope limits which ontology may produce a candidate',()=>{
  const all=mapConcepts([c('1','spleen')],tables)[0]!;expect(all.status).toBe('ambiguous');
  const scoped=mapConcepts([c('1','spleen')],tables,{scope:new Map([['1',['UBERON']]])})[0]!;
  expect(scoped.status).toBe('candidate');expect(scoped.candidates.map(x=>x.ontology)).toEqual(['UBERON']);
 });
 test('an empty scope means no imported ontology serves the concept, so it is not searched at all',()=>{
  const [m]=mapConcepts([c('1','B cell')],tables,{scope:new Map([['1',[]]]),variants:true});
  expect(m!.status).toBe('unmapped');expect(m!.candidates).toEqual([]);
 });
 test('a concept missing from the scope map is searched everywhere',()=>{
  expect(mapConcepts([c('9','B cell')],tables,{scope:new Map([['1',['UBERON']]])})[0]!.candidates.map(x=>x.id)).toEqual(['CL:0000236']);
 });
 test('name variants never change meaning: only parentheses and "cells" are touched',()=>{
  expect(nameVariants('T follicular helper (Tfh) cells').sort()).toEqual(['t follicular helper cell','t follicular helper cells','t follicular helper tfh cell'].sort());
  expect(nameVariants('IL-21')).toEqual([]);expect(nameVariants('Circulating Tfh cells')).toEqual(['circulating tfh cell']);
 });
 test('no candidate is ever an approved mapping',()=>{
  for(const m of mapConcepts([c('1','spleen'),c('2','B cell'),c('3','unknown thing')],tables,{variants:true}))expect(m.exactMappingApproved).toBe(false);
 });
});
