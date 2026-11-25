import {parseBounded,inspectRequest} from './protocol.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const info=x=>obj(x)&&typeof x.name==='string'&&typeof x.version==='string';
const prefix='io.modelcontextprotocol/';
export function inspectModernRequest(raw){
 let x;try{x=parseBounded(raw)}catch{return {ok:false,reason:'invalid-json'}}
 if(!obj(x)||x.jsonrpc!=='2.0'||!(typeof x.id==='string'||Number.isSafeInteger(x.id))||Object.hasOwn(x,'result')||Object.hasOwn(x,'error'))return {ok:false,reason:'invalid-envelope'};
 if(!['server/discover','tools/list','tools/call'].includes(x.method))return {ok:false,reason:'unsupported-method'};
 const m=x.params?._meta;
 if(!obj(x.params)||!obj(m)||m[prefix+'protocolVersion']!=='2026-07-28')return {ok:false,reason:'missing-or-unsupported-modern-version'};
 if(Object.hasOwn(m,prefix+'clientInfo')&&!info(m[prefix+'clientInfo']))return {ok:false,reason:'invalid-client-info'};
 if(Object.hasOwn(m,prefix+'clientCapabilities')&&!obj(m[prefix+'clientCapabilities']))return {ok:false,reason:'invalid-client-capabilities'};
 if(x.method!=='server/discover'&&!inspectRequest(raw,'2026-07-28').ok)return {ok:false,reason:'invalid-tool-request'};
 return {ok:true,revision:'2026-07-28',scope:'modern-request-envelope-subset',method:x.method};
}
