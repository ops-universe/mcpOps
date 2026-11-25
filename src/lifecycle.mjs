import {parseBounded,inspectRequest} from './protocol.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const id=x=>typeof x==='string'||Number.isSafeInteger(x);
const info=x=>obj(x)&&typeof x.name==='string'&&typeof x.version==='string';
// Offline transcript checker for a deliberately pinned legacy session, not a negotiator.
export function inspectLegacyTranscript(raw){
 let xs;try{xs=parseBounded(raw)}catch{return {ok:false,reason:'invalid-json'}}
 if(!Array.isArray(xs)||xs.length<3||xs.length>256)return {ok:false,reason:'transcript-size'};
 const [a,b,c,...rest]=xs;
 if(!obj(a)||a.jsonrpc!=='2.0'||a.method!=='initialize'||!id(a.id)||!obj(a.params)||a.params.protocolVersion!=='2025-11-25'||!obj(a.params.capabilities)||!info(a.params.clientInfo))return {ok:false,reason:'invalid-initialize'};
 if(!obj(b)||b.jsonrpc!=='2.0'||b.id!==a.id||Object.hasOwn(b,'error')||Object.hasOwn(b,'method')||!obj(b.result)||b.result.protocolVersion!=='2025-11-25'||!obj(b.result.capabilities)||!info(b.result.serverInfo))return {ok:false,reason:'invalid-initialize-result'};
 if(!obj(c)||c.jsonrpc!=='2.0'||c.method!=='notifications/initialized'||Object.hasOwn(c,'id')||(Object.hasOwn(c,'params')&&!obj(c.params)))return {ok:false,reason:'invalid-initialized-notification'};
 const pending=new Set(),used=new Set([a.id]);
 for(const x of rest){
 if(!obj(x)||!id(x.id)||x.jsonrpc!=='2.0')return {ok:false,reason:'unsupported-transcript-message'};
 if(Object.hasOwn(x,'method')){
 const v=inspectRequest(JSON.stringify(x),'2025-11-25');
 if(!v.ok||!obj(b.result.capabilities.tools)||used.has(x.id)||Object.hasOwn(x,'result')||Object.hasOwn(x,'error'))return {ok:false,reason:'invalid-tool-request'};
 pending.add(x.id);used.add(x.id);
 }else{
 if(!pending.delete(x.id)||Object.hasOwn(x,'result')===Object.hasOwn(x,'error'))return {ok:false,reason:'unmatched-response'};
 if(Object.hasOwn(x,'result')&&!obj(x.result))return {ok:false,reason:'invalid-result'};
 if(Object.hasOwn(x,'error')&&(!obj(x.error)||!Number.isSafeInteger(x.error.code)||typeof x.error.message!=='string'))return {ok:false,reason:'invalid-error'};
 }}
 if(pending.size)return {ok:false,reason:'incomplete-transcript'};
 return {ok:true,revision:'2025-11-25',scope:'pinned-legacy-tools-transcript-subset',requests:used.size-1};
}
