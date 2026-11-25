import React,{useState} from 'react';
import {inspectTool} from '../../src/protocol.mjs';
import {inspectModernRequest} from '../../src/modern.mjs';
import {inspectLegacyTranscript} from '../../src/lifecycle.mjs';
import {inspectSecurity} from '../../src/security.mjs';
import {inspectPermissions} from '../../src/permissions.mjs';
import {inspectInventory} from '../../src/registry.mjs';
const modes={modern:inspectModernRequest,legacy:inspectLegacyTranscript,tool:inspectTool,security:inspectSecurity,permissions:inspectPermissions,inventory:inspectInventory};
const initial=JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list',params:{_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28'}}},null,2);
export function Inspector(){const [mode,setMode]=useState('modern'),[raw,setRaw]=useState(initial),[report,setReport]=useState(null);function run(e){e.preventDefault();const v=modes[mode](raw);setReport(mode==='inventory'&&v.ok?{ok:true,toolCount:v.inventory.tools.length,capabilities:v.inventory.capabilities.length,unsupportedCount:v.inventory.unsupported.length}:v)}
return <section id="inspector" style={{maxWidth:900,margin:'2rem auto',padding:'1rem'}}><h2>Offline inspector</h2><p>Local validation only. No server connection or tool execution. Use synthetic input.</p><form onSubmit={run}><label htmlFor="mode">Inspection mode</label><select id="mode" value={mode} onChange={e=>{setMode(e.target.value);setReport(null)}}>{Object.keys(modes).map(m=><option key={m}>{m}</option>)}</select><label htmlFor="payload" style={{display:'block'}}>JSON payload</label><textarea id="payload" rows={12} maxLength={65536} value={raw} onChange={e=>{setRaw(e.target.value);setReport(null)}} style={{width:'100%',fontFamily:'monospace'}}/><button type="submit">Inspect locally</button></form><h3>Validation evidence</h3><pre role="status" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{report?JSON.stringify(report,null,2):'No inspection run yet.'}</pre></section>}
