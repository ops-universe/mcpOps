import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createMcpHandler,McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {inspectModernRequest} from '../src/modern.mjs';
import {inspectResponse} from '../src/harness.mjs';
const endpoint='http://mcpops.invalid/mcp';
export function trustedFetch(handler, evidence){
 return async (url,init)=>{
 const request=new Request(url,init);
 if(request.url!==endpoint||request.method!=='POST')throw Error('endpoint or method denied');
 const raw=await request.clone().text();
 if(new TextEncoder().encode(raw).length>65536)throw Error('request limit');
 const inspected=inspectModernRequest(raw);
 // Discovery probes may negotiate before a version is selected; record, do not authorize tools from metadata.
 const message=JSON.parse(raw);
 if(!['server/discover','tools/list','tools/call'].includes(message.method))throw Error('method denied');
 if(message.method==='tools/call'&&(!inspected.ok||message.params?.name!=='lookup'||message.params?.arguments?.sku!=='SYNTHETIC-1'))throw Error('tool denied');
 if(message.method==='tools/list'&&!inspected.ok)throw Error('request denied');
 const response=await handler.fetch(request);
 const type=response.headers.get('content-type')??'';
 const wire=await response.clone().text();
 if(new TextEncoder().encode(wire).length>65536)throw Error('response limit');
 let bodies;
 if(type.includes('application/json'))bodies=[wire];
 else if(type.includes('text/event-stream'))bodies=wire.split(/\r?\n\r?\n/).map(event=>event.split(/\r?\n/).filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trimStart()).join('\n')).filter(Boolean);
 else throw Error('unsupported response media type');
 if(bodies.length!==1)throw Error('unexpected response count');
 const checked=inspectResponse(bodies[0],message);
 if(!checked.ok||checked.outcome!=='result')throw Error('response validation failed: '+(checked.reason??checked.outcome));
 evidence.push({method:message.method,inspection:inspected.ok,responseInspection:true,status:response.status});
 return response;
 };
}
export async function verifyTrustedSdk({authorized=false}={}){
 if(authorized!==true)throw Error('explicit synthetic integration authorization required');
 let calls=0;const evidence=[];
 const handler=createMcpHandler(()=>{
 const server=new McpServer({name:'mcpops-synthetic',version:'1.0.0'});
 server.registerTool('lookup',{description:'Synthetic inventory lookup',inputSchema:z.object({sku:z.literal('SYNTHETIC-1')})},async()=>{calls++;return {content:[{type:'text',text:'available'}]}});
 return server;
 },{legacy:'reject'});
 const client=new Client({name:'mcpops-verifier',version:'1.0.0'},{versionNegotiation:{mode:'auto'}});
 try{
 await client.connect(new StreamableHTTPClientTransport(new URL(endpoint),{fetch:trustedFetch(handler,evidence)}));
 if(client.getProtocolEra()!=='modern')throw Error('modern era required');
 const list=await client.listTools();
 const result=await client.callTool({name:'lookup',arguments:{sku:'SYNTHETIC-1'}});
 return {era:client.getProtocolEra(),tools:list.tools.map(t=>t.name),result,calls,evidence};
 }finally{try{await client.close()}finally{await handler.close()}}
}
