import {parseBounded} from './protocol.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
import {validateArguments} from './schema.mjs';
export const checkArguments=validateArguments;
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
