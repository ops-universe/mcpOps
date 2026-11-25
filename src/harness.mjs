import {parseBounded,inspectRequest,inspectTool} from './protocol.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function inspectResponse(raw,request){
 let x;try{x=parseBounded(raw)}catch{return {ok:false,reason:'invalid-json'}}
 if(!obj(request)||!['tools/list','tools/call','server/discover'].includes(request.method)||!(typeof request.id==='string'||Number.isSafeInteger(request.id)))return {ok:false,reason:'unsupported-response-context'};
 if(!obj(x)||x.jsonrpc!=='2.0'||x.id!==request.id||Object.hasOwn(x,'method'))return {ok:false,reason:'invalid-response-envelope'};
 const result=Object.hasOwn(x,'result'),error=Object.hasOwn(x,'error');
 if(result===error)return {ok:false,reason:'ambiguous-response'};
 if(error)return obj(x.error)&&Number.isSafeInteger(x.error.code)&&typeof x.error.message==='string'?{ok:true,outcome:'rpc-error'}:{ok:false,reason:'invalid-error'};
 if(!obj(x.result))return {ok:false,reason:'invalid-result'};
 if(request.method==='server/discover'&&(!obj(x.result.serverInfo)||typeof x.result.serverInfo.name!=='string'||typeof x.result.serverInfo.version!=='string'||!obj(x.result.capabilities)))return {ok:false,reason:'invalid-discovery-result'};
 if(request.method==='tools/list'&&(!Array.isArray(x.result.tools)||x.result.tools.length>256||x.result.tools.some(t=>!inspectTool(JSON.stringify(t)).ok)||new Set(x.result.tools.map(t=>t.name)).size!==x.result.tools.length||(Object.hasOwn(x.result,'nextCursor')&&typeof x.result.nextCursor!=='string')))return {ok:false,reason:'invalid-tool-list'};
 if(request.method==='tools/call'&&(!Array.isArray(x.result.content)||x.result.content.some(t=>!obj(t)||!((t.type==='text'&&typeof t.text==='string')||(['image','audio'].includes(t.type)&&typeof t.mimeType==='string'&&typeof t.data==='string'&&/^[A-Za-z0-9+/]*={0,2}$/.test(t.data)&&t.data.length%4===0)||(t.type==='resource_link'&&typeof t.uri==='string'&&typeof t.name==='string')))||(Object.hasOwn(x.result,'isError')&&typeof x.result.isError!=='boolean')||(Object.hasOwn(x.result,'structuredContent')&&!obj(x.result.structuredContent))))return {ok:false,reason:'invalid-or-unsupported-tool-content'};
 return {ok:true,outcome:'result',scope:'partial-structural'};
}
export async function runFixture(raw,revision,fixture,{timeoutMs=1000,signal}={}){
 const q=inspectRequest(raw,revision);if(!q.ok)return q;
 if(!obj(fixture)||typeof fixture.response!=='string'||new TextEncoder().encode(fixture.response).byteLength>65536||!Number.isSafeInteger(fixture.delayMs)||fixture.delayMs<0||fixture.delayMs>60000||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)return {ok:false,reason:'invalid-fixture'};
 if(signal?.aborted)return {ok:false,reason:'cancelled'};
 return new Promise(resolve=>{
 let done=false,delay,timer;
 const finish=v=>{if(done)return;done=true;clearTimeout(delay);clearTimeout(timer);signal?.removeEventListener('abort',abort);resolve({...v,transport:'mock'})};
 const abort=()=>finish({ok:false,reason:'cancelled'});
 signal?.addEventListener('abort',abort,{once:true});
 timer=setTimeout(()=>finish({ok:false,reason:'timeout'}),timeoutMs);
 delay=setTimeout(()=>finish(inspectResponse(fixture.response,q.request)),fixture.delayMs);
 });
}
