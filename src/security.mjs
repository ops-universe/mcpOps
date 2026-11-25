import {parseBounded} from './protocol.mjs';
const secretKey=/^(?:authorization|cookie|set-cookie|password|passwd|secret|token|api[-_]?key|access[-_]?token|refresh[-_]?token|client[-_]?secret)$/i;
const injection=/ignore\s+(?:all\s+)?(?:previous|prior|system)\s+instructions|reveal\s+(?:the\s+)?(?:secret|system prompt)|bypass\s+(?:approval|policy)/i;
export function inspectSecurity(raw){
 let root;try{root=parseBounded(raw)}catch{return {ok:false,reason:'invalid-json'}}
 const findings=[],stack=[{value:root,depth:0}],seen=new Set();let nodes=0;
 const warn=code=>{if(!seen.has(code)){seen.add(code);findings.push({code,classification:'heuristic-warning',verifiedVulnerability:false})}};
 while(stack.length){const {value,depth}=stack.pop();if(++nodes>10000||depth>32)return {ok:false,reason:'inspection-limit'};
 if(value&&typeof value==='object'){for(const [key,v] of Object.entries(value)){if(secretKey.test(key)){warn('secret-like-field');continue}if(/^(command|args|env|url)$/i.test(key))warn('connection-or-execution-config');if(/^(destructiveHint|openWorldHint)$/i.test(key)&&v===true)warn('declared-capability-risk');stack.push({value:v,depth:depth+1})}}
 else if(typeof value==='string'&&injection.test(value))warn('instruction-injection-pattern');
 }
 return {ok:true,findings:findings.sort((a,b)=>a.code.localeCompare(b.code)),scope:'heuristic-only'};
}
// Redacts entire unknown free-form strings; only approved structural constants remain visible.
export function redactEvidence(raw){
 let root;try{root=parseBounded(raw)}catch{return {ok:false,reason:'invalid-json'}}
 let nodes=0;
 function visit(x,depth){if(++nodes>10000||depth>32)throw Error('limit');if(Array.isArray(x))return x.map(v=>visit(v,depth+1));if(x&&typeof x==='object')return Object.entries(x).map(([k,v])=>({key:secretKey.test(k)?'[SECRET FIELD]':'[FIELD]',value:secretKey.test(k)?'[REDACTED]':visit(v,depth+1)}));return '[REDACTED]'}
 try{return {ok:true,evidence:visit(root,0)}}catch{return {ok:false,reason:'inspection-limit'}}
}
