import {parseBounded} from './protocol.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const primitive=(v,t)=>t==='integer'?Number.isSafeInteger(v):t==='number'?typeof v==='number'&&Number.isFinite(v):t==='null'?v===null:['string','boolean'].includes(t)&&typeof v===t;
export function checkArguments(schema,args){
 if(!obj(schema)||schema.type!=='object'||!obj(args))return false;
 if(Object.keys(schema).some(k=>!['type','properties','required','additionalProperties','description','title'].includes(k)))return false;
 const props=schema.properties??{};const required=schema.required??[];
 if(!obj(props)||!Array.isArray(required)||required.some(k=>typeof k!=='string'||!Object.hasOwn(props,k))|| (Object.hasOwn(schema,'additionalProperties')&&schema.additionalProperties!==false))return false;
 for(const [k,v] of Object.entries(props)){if(!obj(v)||!['integer','number','string','boolean','null'].includes(v.type)||Object.keys(v).some(p=>!['type','description','title'].includes(p)))return false;}
 return required.every(k=>Object.hasOwn(args,k))&&Object.entries(args).every(([k,v])=>Object.hasOwn(props,k)&&primitive(v,props[k].type));
}
// policy is caller-supplied trusted local configuration, never derived from inventory trust or annotations.
export function dryRun(registry,raw,policy){
 let request;try{request=parseBounded(raw)}catch{return {decision:'deny',reason:'invalid-json'}}
 if(!obj(request)||typeof request.server!=='string'||typeof request.tool!=='string'||!obj(request.arguments))return {decision:'deny',reason:'invalid-request'};
 const server=registry.get(request.server),tool=server?.tools.find(t=>t.name===request.tool);
 if(!tool)return {decision:'deny',reason:'unknown-tool'};
 if(!obj(policy)||!Object.hasOwn(policy,request.server)||!obj(policy[request.server])||!Object.hasOwn(policy[request.server],request.tool))return {decision:'deny',reason:'not-allowlisted'};
 const risk=policy[request.server][request.tool];
 if(!['low','high'].includes(risk))return {decision:'deny',reason:'policy-deny'};
 if(!checkArguments(tool.inputSchema,request.arguments))return {decision:'deny',reason:'invalid-or-unsupported-schema'};
 return {decision:risk==='high'?'review':'allow',reason:'dry-run-only',execution:false};
}
