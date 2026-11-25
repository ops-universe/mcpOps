import {inspectInventory} from './registry.mjs';
import {parseBounded} from './protocol.mjs';
import {inspectSecurity} from './security.mjs';
// Explicit user-selected snapshots only. No automatic browser persistence or arbitrary filesystem access.
export function inventorySnapshot(raw){
 const v=inspectInventory(raw);if(!v.ok)return v;
 const security=inspectSecurity(raw);if(!security.ok||security.findings.length)return {ok:false,reason:'unsafe-snapshot'};
 try{const x=parseBounded(raw);const allowed=['id','revision','trust','capabilities','tools'];if(Object.keys(x).some(k=>!allowed.includes(k)))return {ok:false,reason:'unsupported-snapshot-field'};
 // Store only the normalized inspection profile, never executable descriptors.
 const snapshot={id:v.inventory.id,revision:v.inventory.revision,trust:'untrusted',capabilities:Object.fromEntries(v.inventory.capabilities.map(k=>[k,{}])),tools:v.inventory.tools.map(t=>({name:t.name,inputSchema:t.inputSchema}))};
 const text=JSON.stringify(snapshot,null,2);if(new TextEncoder().encode(text).length>65536)return {ok:false,reason:'snapshot-limit'};
 return {ok:true,text,toolCount:snapshot.tools.length};
 }catch{return {ok:false,reason:'invalid-snapshot'}}
}
