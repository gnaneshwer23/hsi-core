/** The designed order of one investigation, expressed over the capability records. Order and grouping are design; reads, responsibilities and limits come from the records. */
export type FlowStage={id:string;title:string;short:string;slugs:string[];human?:boolean;trace:"source"|"assertion"|"relationship"|"context"|"limits"|"status"};
export const FLOW_STAGES:FlowStage[]=[
  {id:"sources",title:"Find and clear sources",short:"Retrieve",slugs:["scout","aegis"],trace:"source"},
  {id:"extract",title:"Extract with context",short:"Extract",slugs:["lantern"],trace:"assertion"},
  {id:"map",title:"Map to the graph",short:"Map",slugs:["atlas"],trace:"relationship"},
  {id:"compare",title:"Compare in context",short:"Compare",slugs:["parallax","helix"],trace:"context"},
  {id:"challenge",title:"Challenge the reading",short:"Challenge",slugs:["veritas","vantage"],trace:"limits"},
  {id:"review",title:"Human review",short:"Review",slugs:["arbiter"],human:true,trace:"status"},
];
export const COORDINATION_SLUGS=["nexus"] as const;
export const ASSURANCE_SLUGS=["sentinel","caliber","warden"] as const;
