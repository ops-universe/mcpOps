import test from 'node:test';import assert from 'node:assert/strict';import {inspectModernRequest} from '../src/modern.mjs';
const make=(method='tools/list',meta={'io.modelcontextprotocol/protocolVersion':'2026-07-28'})=>({jsonrpc:'2.0',id:1,method,params:{_meta:meta}});
const check=x=>inspectModernRequest(JSON.stringify(x));
test('modern discovery optional; standalone tools request accepted',()=>{assert.equal(check(make()).ok,true);assert.equal(check(make('server/discover')).ok,true)});
test('reject legacy lifecycle and missing or wrong per-request version',()=>{assert.equal(check(make('initialize')).ok,false);assert.equal(check(make('tools/list',{})).ok,false);assert.equal(check(make('tools/list',{'io.modelcontextprotocol/protocolVersion':'2025-11-25'})).ok,false)});
test('optional client identity validated when supplied',()=>{const x=make();x.params._meta['io.modelcontextprotocol/clientInfo']={name:'synthetic',version:'1'};assert.equal(check(x).ok,true);x.params._meta['io.modelcontextprotocol/clientInfo']=true;assert.equal(check(x).ok,false)});
test('call requires tool name',()=>{const x=make('tools/call');assert.equal(check(x).ok,false);x.params.name='lookup';assert.equal(check(x).ok,true)});
