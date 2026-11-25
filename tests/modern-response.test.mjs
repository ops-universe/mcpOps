import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectResponse} from '../src/harness.mjs';
const q={jsonrpc:'2.0',id:1,method:'server/discover',params:{_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28'}}};
const result={resultType:'complete',supportedVersions:['2026-07-28'],capabilities:{tools:{}},cacheScope:'private',ttlMs:0,_meta:{'io.modelcontextprotocol/serverInfo':{name:'synthetic',version:'1'}}};
const inspect=(r,request=q)=>inspectResponse(JSON.stringify({jsonrpc:'2.0',id:1,result:r}),request);
test('modern discovery uses supported versions and optional metadata identity',()=>{assert.equal(inspect(result).ok,true);const {_meta,...anonymous}=result;assert.equal(inspect(anonymous).ok,true);assert.equal(inspect({...result,_meta:{'io.modelcontextprotocol/serverInfo':false}}).ok,true)});
test('modern discovery denies legacy-shaped, incompatible or malformed results',()=>{for(const r of [{serverInfo:{name:'x',version:'1'},capabilities:{}},{...result,supportedVersions:['2025-11-25']},{...result,supportedVersions:[null]},{...result,cacheScope:'unknown'},{...result,ttlMs:-1},{...result,resultType:'input_required'},{...result,_meta:[]}])assert.equal(inspect(r).ok,false)});
test('modern tool results require complete discriminator; legacy remains supported',()=>{const modern={...q,method:'tools/list'},legacy={id:1,method:'tools/list'};assert.equal(inspect({tools:[]},modern).ok,false);assert.equal(inspect({resultType:'complete',tools:[]},modern).ok,true);assert.equal(inspect({tools:[]},legacy).ok,true)});
