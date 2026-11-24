import test from 'node:test';import assert from 'node:assert/strict';import {inspectRequest,inspectTool,mockRequest} from '../src/protocol.mjs';
const req=JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'}), rev='2025-11-25';
for(const v of [rev,'2026-07-28'])test('offline subset '+v,()=>assert.equal(inspectRequest(req,v).ok,true));
test('unknown revision',()=>assert.equal(inspectRequest(req,'future').ok,false));
test('malformed and oversized',()=>{for(const s of ['{',' '.repeat(65537)])assert.equal(inspectRequest(s,rev).ok,false)});
test('unsupported method',()=>assert.equal(inspectRequest(req.replace('tools/list','shell/exec'),rev).ok,false));
test('missing call name',()=>assert.equal(inspectRequest(req.replace('tools/list','tools/call'),rev).ok,false));
test('descriptor shape',()=>{assert.equal(inspectTool('{"name":"lookup","inputSchema":{"type":"object"}}').ok,true);assert.equal(inspectTool('{"name":"lookup","inputSchema":[]}').ok,false)});
test('mock isolation and missing fixture',()=>{const f={tools:[]};const v=mockRequest(req,rev,new Map([['tools/list',f]]));assert.equal(v.response.id,1);v.response.result.tools.push('changed');assert.deepEqual(f.tools,[]);assert.equal(mockRequest(req,rev,new Map()).ok,false)});
