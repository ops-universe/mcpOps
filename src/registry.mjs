import {parseBounded,inspectTool,revisions} from './protocol.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(x);
export function inspectInventory(raw){
 let x;try{x=parseBounded(raw)}catch{return {ok:false,reason:'invalid-json'}}
 if(!obj(x)||!validId(x.id)||!revisions.includes(x.revision)||!obj(x.capabilities)||!Array.isArray(x.tools)||x.tools.length>256)return {ok:false,reason:'invalid-inventory'};
 if(Object.hasOwn(x,'command')||Object.hasOwn(x,'url')||Object.hasOwn(x,'args')||Object.hasOwn(x,'env'))return {ok:false,reason:'execution-config-not-supported'};
 if(!['untrusted','synthetic','trusted'].includes(x.trust))return {ok:false,reason:'invalid-trust'};
 const names=new Set();
 for(const tool of x.tools){if(!inspectTool(JSON.stringify(tool)).ok)return {ok:false,reason:'invalid-tool'};if(names.has(tool.name))return {ok:false,reason:'duplicate-tool'};names.add(tool.name)}
 if(x.tools.length&&!obj(x.capabilities.tools))return {ok:false,reason:'tools-capability-missing'};
 const unsupported=Object.keys(x.capabilities).filter(k=>k!=='tools').sort();
 return {ok:true,inventory:{id:x.id,revision:x.revision,declaredTrust:x.trust,capabilities:Object.keys(x.capabilities).sort(),unsupported,tools:x.tools.map(t=>({name:t.name,inputSchema:t.inputSchema}))}};
}
export class Registry{
 #entries=new Map();
 register(raw){const v=inspectInventory(raw);if(!v.ok)return v;const x=v.inventory;if(this.#entries.has(x.id))return {ok:false,reason:'duplicate-server'};if(this.#entries.size>=256)return {ok:false,reason:'registry-limit'};this.#entries.set(x.id,structuredClone(x));return {ok:true,id:x.id}}
 get(id){const x=this.#entries.get(id);return x?structuredClone(x):undefined}
 list(){return [...this.#entries.values()].map(x=>structuredClone(x)).sort((a,b)=>a.id.localeCompare(b.id))}
}
