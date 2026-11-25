import {randomUUID,createHash} from 'node:crypto';
import {dryRun} from './governance.mjs';
import {parseBounded} from './protocol.mjs';
// In-memory simulation only; the trusted operator invokes approve, never the MCP server.
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function binding(registry,raw,policy){const decision=dryRun(registry,raw,policy);if(decision.decision!=='review')return null;const q=parseBounded(raw);return digest([raw,registry.get(q.server),policy[q.server][q.tool]])}
export class ApprovalLedger {
 #records=new Map();
 approve(registry,raw,policy,{ttlMs=60000}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1||ttlMs>300000||this.#records.size>=256)return {ok:false,reason:'approval-limit'};
 const hash=binding(registry,raw,policy);if(!hash)return {ok:false,reason:'not-reviewable'};
 const token=randomUUID();this.#records.set(token,{hash,expires:Date.now()+ttlMs});return {ok:true,token}
 }
 consume(token,registry,raw,policy){
 const record=this.#records.get(token);if(!record)return {ok:false,reason:'unknown-or-used'};
 this.#records.delete(token);
 if(Date.now()>=record.expires)return {ok:false,reason:'expired'};
 if(binding(registry,raw,policy)!==record.hash)return {ok:false,reason:'binding-mismatch'};
 return {ok:true,decision:'approved-simulation',execution:false}
 }
}
