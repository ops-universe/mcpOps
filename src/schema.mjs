// Bounded closed-world schema profile; unsupported keywords fail closed.
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>Object.hasOwn(x,k);
const types=['object','array','string','integer','number','boolean','null'];
const common=['type','description','title','enum','const'];
const extra={object:['properties','required','additionalProperties'],array:['items','minItems','maxItems'],string:['minLength','maxLength'],integer:['minimum','maximum'],number:['minimum','maximum'],boolean:[],null:[]};
const equal=(a,b)=>{if(a===b)return true;if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((v,i)=>equal(v,b[i]));if(obj(a)&&obj(b))return Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>own(b,k)&&equal(a[k],b[k]));return false};
export function validateArguments(schema,value){
 let nodes=0;
 function shape(s,d){if(++nodes>10000||d>24||!obj(s)||!types.includes(s.type)||Object.keys(s).some(k=>!common.includes(k)&&!extra[s.type].includes(k)))return false;
 if(own(s,'enum')&&(!Array.isArray(s.enum)||!s.enum.length||s.enum.length>256))return false;
 for(const k of ['minItems','maxItems','minLength','maxLength'])if(own(s,k)&&(!Number.isSafeInteger(s[k])||s[k]<0))return false;
 for(const k of ['minimum','maximum'])if(own(s,k)&&!Number.isFinite(s[k]))return false;
 for(const [a,b] of [['minItems','maxItems'],['minLength','maxLength'],['minimum','maximum']])if(own(s,a)&&own(s,b)&&s[a]>s[b])return false;
 if(s.type==='object'){const p=own(s,'properties')?s.properties:{},r=own(s,'required')?s.required:[];return obj(p)&&Array.isArray(r)&&new Set(r).size===r.length&&r.every(k=>typeof k==='string'&&own(p,k))&&(!own(s,'additionalProperties')||s.additionalProperties===false)&&Object.values(p).every(v=>shape(v,d+1))}
 if(s.type==='array')return own(s,'items')&&shape(s.items,d+1);
 return true}
 function match(s,v,d){if(++nodes>10000||d>24)return false;const t=s.type;if(t==='object'?!obj(v):t==='array'?!Array.isArray(v):t==='null'?v!==null:t==='integer'?!Number.isSafeInteger(v):t==='number'?!Number.isFinite(v):typeof v!==t)return false;
 if(own(s,'const')&&!equal(s.const,v)||own(s,'enum')&&!s.enum.some(e=>equal(e,v)))return false;
 if(t==='object'){const p=s.properties??{};return (s.required??[]).every(k=>own(v,k))&&Object.entries(v).every(([k,x])=>own(p,k)&&match(p[k],x,d+1))}
 if(t==='array')return v.length>=(s.minItems??0)&&v.length<=(s.maxItems??10000)&&v.every(x=>match(s.items,x,d+1));
 if(t==='string'){const n=[...v].length;return n>=(s.minLength??0)&&n<=(s.maxLength??Infinity)}
 if(t==='number'||t==='integer')return v>=(s.minimum??-Infinity)&&v<=(s.maximum??Infinity);
 return true}
 // JSON inputs only; bound recursion even when enum/const values are nested.
 try{const raw=JSON.stringify([schema,value]);if(typeof raw!=='string'||new TextEncoder().encode(raw).length>65536)return false;const stack=[[schema,0],[value,0]];let count=0;while(stack.length){const [x,d]=stack.pop();if(++count>10000||d>24)return false;if(x&&typeof x==='object')for(const y of Object.values(x))stack.push([y,d+1])}return schema?.type==='object'&&shape(schema,0)&&match(schema,value,0)}catch{return false}
}
