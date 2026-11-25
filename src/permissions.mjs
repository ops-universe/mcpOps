import {parseBounded} from './protocol.mjs';
import {inspectSecurity} from './security.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function inspectPermissions(raw){
 let x;try{x=parseBounded(raw)}catch{return {ok:false,reason:'invalid-json'}}
 if(!obj(x)||!obj(x.requested)||!obj(x.allowed))return {ok:false,reason:'invalid-permission-input'};
 const keys=['filesystem','network','process','secrets'];
 const valid=v=>Object.keys(v).every(k=>keys.includes(k)&&Array.isArray(v[k])&&v[k].length<=256&&v[k].every(s=>typeof s==='string'&&s.length>0&&s.length<=512));
 if(!valid(x.requested)||!valid(x.allowed))return {ok:false,reason:'invalid-permission-input'};
 const categories=keys.map(k=>{const allowed=new Set(x.allowed[k]??[]),requested=new Set(x.requested[k]??[]);return {category:k,requested:requested.size,unapproved:[...requested].filter(s=>!allowed.has(s)||s.includes('*')).length}});
 return {ok:true,decision:categories.some(c=>c.unapproved)?'deny':'within-declared-policy',categories,execution:false,scope:'operator-declared-exact-string-comparison'}
}
export function inspectConfiguration(raw){const v=inspectSecurity(raw);if(!v.ok)return v;return {...v,execution:false,scope:'static-heuristics-only'}}
