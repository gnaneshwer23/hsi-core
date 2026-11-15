/**
 * DEMO content for the research program. None of it is real: there are no live company, event or digest feeds behind it.
 * It shows how each surface behaves once those sources exist, and every use of it is labelled "Demo" in the UI.
 * Organisation and event names are deliberately generic placeholders, never real companies or people.
 */
export const DEMO_NOTE="Demo content. Illustrative placeholders, not real organisations, events or publications.";

export type DemoOrg={id:string;name:string;what:string;how:string;learn:string};
export const demoOrgs=(topic:string):DemoOrg[]=>[
 {id:"o1",name:"Example Biotech A",what:`Clinical-stage programme aimed at ${topic} signalling`,how:"Antibody approach, Phase 2 in a connective-tissue indication",learn:"Public trial registry entry and a conference abstract would be linked here"},
 {id:"o2",name:"Example Pharma B",what:`Pipeline asset in the ${topic} axis`,how:"Small-molecule inhibitor, preclinical models reported",learn:"Pipeline page and scientific advisory talks would be linked here"},
 {id:"o3",name:"Example Institute C",what:`Academic group studying ${topic} in patient tissue`,how:"Single-cell profiling of biopsies",learn:"Group publications and open datasets would be linked here"},
];
export type DemoEvent={id:string;title:string;kind:string;when:string;who:string};
export const demoEvents=(topic:string):DemoEvent[]=>[
 {id:"e1",title:`Webinar: what is known and unknown about ${topic}`,kind:"Webinar",when:"Next week",who:"Example Biotech A"},
 {id:"e2",title:`Journal club: recent ${topic} studies`,kind:"Journal club",when:"In two weeks",who:"Example Institute C"},
 {id:"e3",title:"Open call for collaborators in autoimmune research",kind:"Opportunity",when:"Open",who:"Example Pharma B"},
];
export type DemoItem={id:string;kind:"Paper"|"Trial"|"Correction"|"News";title:string;why:string};
export const demoDigest=(topics:string[]):DemoItem[]=>{
 const a=topics[0]??"your topic",b=topics[1]??a;
 return [
  {id:"d1",kind:"Paper",title:`New study reports ${a} signalling in patient-derived tissue`,why:`Matches your anchor ${a}`},
  {id:"d2",kind:"Trial",title:`Registry update: Phase 2 study touching ${b}`,why:`Matches your anchor ${b}`},
  {id:"d3",kind:"Correction",title:`Correction issued for a paper on ${a}`,why:"A paper you may rely on changed"},
  {id:"d4",kind:"News",title:`Review article: expanding the ${a} to ${b} connection`,why:"Links two of your anchors"},
 ];
};
export type Assistant={id:"watch"|"map"|"challenge"|"brief";name:string;does:string;real:boolean};
export const ASSISTANTS:readonly Assistant[]=[
 {id:"watch",name:"Watch",does:"Scans papers, trials and corrections for your anchors and builds the digest.",real:false},
 {id:"map",name:"Map",does:"Finds concepts one step beyond your current depth and proposes them as candidates to explore.",real:true},
 {id:"challenge",name:"Challenge",does:"Lists recorded relationships in your area that are reported as negated, so you see counter-evidence.",real:true},
 {id:"brief",name:"Brief",does:"Writes a short summary of what your program covers and where it is thin.",real:true},
];
