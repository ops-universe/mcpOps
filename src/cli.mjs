import {inspectRequest,inspectTool,parseBounded} from './protocol.mjs';
import {Registry,inspectInventory} from './registry.mjs';
import {dryRun} from './governance.mjs';
import {inspectSecurity,redactEvidence} from './security.mjs';
import {runFixture} from './harness.mjs';
import {inspectLegacyTranscript} from './lifecycle.mjs';
import {inspectPermissions,inspectConfiguration} from './permissions.mjs';
import {inspectModernRequest} from './modern.mjs';
import {stdin,stdout,stderr} from 'node:process';
async function read(){let n=0;const chunks=[];for await(const c of stdin){n+=c.length;if(n>65536)throw Error('input limit');chunks.push(c)}return Buffer.concat(chunks).toString('utf8')}
async function main(){const [cmd,rev,...rest]=process.argv.slice(2);if(rest.length||!['request','tool','inventory','governance','security','redact','test','legacy-transcript','permissions','configuration','modern-request'].includes(cmd))throw Error('Usage: node src/cli.mjs request|tool|inventory|governance|security|redact|test|legacy-transcript|permissions|configuration|modern-request [revision]; JSON on stdin');
 if(cmd!=='request'&&rev!==undefined)throw Error('unexpected argument');
 const raw=await read();let out;
 switch(cmd){case 'request':{const v=inspectRequest(raw,rev);out=v.ok?{ok:true,scope:v.scope,revision:v.revision}:v;break}
 case 'tool':out=inspectTool(raw);break;
 case 'inventory':{const v=inspectInventory(raw);out=v.ok?{ok:true,toolCount:v.inventory.tools.length,capabilityCount:v.inventory.capabilities.length,unsupportedCount:v.inventory.unsupported.length}:v;break}
 case 'modern-request':out=inspectModernRequest(raw);break;
 case 'legacy-transcript':out=inspectLegacyTranscript(raw);break;
 case 'permissions':out=inspectPermissions(raw);break;
 case 'configuration':out=inspectConfiguration(raw);break;
 case 'security':out=inspectSecurity(raw);break;
 case 'redact':out=redactEvidence(raw);break;
 case 'governance':{const x=parseBounded(raw),r=new Registry();if(!r.register(JSON.stringify(x.inventory)).ok)throw Error('invalid inventory');out=dryRun(r,JSON.stringify(x.request),x.policy);break}
 case 'test':{const x=parseBounded(raw);out=await runFixture(JSON.stringify(x.request),x.revision,x.fixture,{timeoutMs:x.timeoutMs??1000});break}
 }
 stdout.write(JSON.stringify(out)+'\n');if(out.ok===false||out.decision==='deny')process.exitCode=1;
}
main().catch(()=>{stderr.write('Invalid input or command. See README.\n');process.exitCode=2});
