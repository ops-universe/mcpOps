import {parseBounded} from './protocol.mjs';
import {Registry} from './registry.mjs';
import {dryRun} from './governance.mjs';
import {inspectResponse} from './harness.mjs';
export function simulateGovernance(raw){try{const x=parseBounded(raw),r=new Registry();if(!r.register(JSON.stringify(x.inventory)).ok)return {decision:'deny',reason:'invalid-inventory',execution:false};return {...dryRun(r,JSON.stringify(x.request),x.policy),execution:false}}catch{return {decision:'deny',reason:'invalid-input',execution:false}}}
export function inspectExchange(raw){try{const x=parseBounded(raw);return inspectResponse(JSON.stringify(x.response),x.request)}catch{return {ok:false,reason:'invalid-input'}}}
