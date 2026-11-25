import {open, mkdir, link, unlink, lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {constants} from 'node:fs';
import {Registry,inspectInventory} from './registry.mjs';
// Directory is explicitly supplied by a trusted local operator, not a descriptor.
export class LocalRegistry {
 #root;
 constructor(root){if(typeof root!=='string'||!root)throw Error('trusted directory required');this.#root=resolve(root)}
 async #prepare(){await mkdir(this.#root,{recursive:true,mode:0o700});const s=await lstat(this.#root);if(!s.isDirectory()||s.isSymbolicLink()||(s.mode&0o077))throw Error('unsafe registry directory')}
 async register(raw){
 const v=inspectInventory(raw);if(!v.ok)return v;
 await this.#prepare();const target=join(this.#root,v.inventory.id+'.json'),tmp=join(this.#root,'.'+randomUUID()+'.tmp');
 let f;try{f=await open(tmp,'wx',0o600);await f.writeFile(raw,'utf8');await f.sync();await f.close();f=undefined;await link(tmp,target);return {ok:true,id:v.inventory.id}}catch(e){if(e.code==='EEXIST')return {ok:false,reason:'duplicate-server'};throw e}finally{if(f)await f.close();await unlink(tmp).catch(()=>{})}
 }
 async load(id){if(typeof id!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(id))throw Error('invalid id');await this.#prepare();const f=await open(join(this.#root,id+'.json'),constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);try{const s=await f.stat();if(!s.isFile()||s.size>65536||(s.mode&0o077))throw Error('unsafe registry file');const buf=Buffer.alloc(65537);let n=0;while(n<buf.length){const {bytesRead}=await f.read(buf,n,buf.length-n,null);if(!bytesRead)break;n+=bytesRead}if(n>65536)throw Error('size limit');const raw=buf.subarray(0,n).toString('utf8');const v=inspectInventory(raw);if(!v.ok||v.inventory.id!==id)throw Error('invalid stored inventory');const registry=new Registry();registry.register(raw);return registry}finally{await f.close()}}
}
