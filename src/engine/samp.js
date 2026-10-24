// SAMP, the Web Profile: this page talks to a hub on localhost:21012 (TOPCAT, Aladin,
// DS9 start one) with XML-RPC over HTTP. Registering asks the hub owner for permission
// in the hub's own window. Outgoing: the field the telescope looks at (coord.pointAt.sky)
// and a set as a VOTable (table.load.votable). Incoming: coord.pointAt.sky turns the
// telescope. Nothing runs without the user pressing Connect.
import { api } from '../lib/api.js';
import { votableOf } from '../lib/export.js';
import { samp as store } from '../lib/stores.js';
import { lookAt } from './actions.js';
import { exportTable } from './exports.js';
import { fieldCentre } from './fieldquery.js';
import { S } from './state.js';
import { USER } from './userdata.js';
const HUB='http://localhost:21012/';
const SAMP={ key:null, self:null, hub:null, clients:0, polling:false, sent:0, received:0 };
export { SAMP };
// ---- XML-RPC, the subset SAMP uses (strings, lists, maps) ----
const xesc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function enc(v){
  if(Array.isArray(v)) return `<value><array><data>${v.map(enc).join('')}</data></array></value>`;
  if(v&&typeof v==='object') return `<value><struct>${Object.entries(v).map(([k,x])=>`<member><name>${xesc(k)}</name>${enc(x)}</member>`).join('')}</struct></value>`;
  return `<value><string>${xesc(v)}</string></value>`;
}
function dec(el){
  if(!el) return null;
  const v=el.tagName==='value'?(el.firstElementChild||el):el;
  if(v===el&&el.tagName==='value') return el.textContent;                 // bare text in <value>
  switch(v.tagName){
    case 'string': case 'int': case 'i4': case 'double': case 'boolean': return v.textContent;
    case 'array': return [...v.querySelectorAll(':scope > data > value')].map(dec);
    case 'struct': { const o={}; for(const m of v.querySelectorAll(':scope > member')){ o[m.querySelector(':scope > name').textContent]=dec(m.querySelector(':scope > value')); } return o; }
    default: return v.textContent;
  }
}
async function call(method, params, timeoutMs=8000){
  const body=`<?xml version="1.0"?><methodCall><methodName>${xesc(method)}</methodName><params>${params.map(p=>`<param>${enc(p)}</param>`).join('')}</params></methodCall>`;
  const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),timeoutMs);
  try{
    const r=await fetch(HUB,{ method:'POST', headers:{'Content-Type':'text/xml'}, body, signal:ctl.signal });
    if(!r.ok) throw new Error('hub answered HTTP '+r.status);
    const d=new DOMParser().parseFromString(await r.text(),'application/xml');
    const fault=d.querySelector('fault'); if(fault) throw new Error('hub fault: '+(dec(fault.querySelector('value'))?.faultString||'?'));
    return dec(d.querySelector('methodResponse > params > param > value'));
  } finally{ clearTimeout(t); }
}
function publish(state, msg){ store.set({ state, msg:msg||'', hub:SAMP.hub, clients:SAMP.clients, sent:SAMP.sent, received:SAMP.received }); }
// ---- registration ----
export async function sampConnect(){
  if(SAMP.key) return true;
  publish('connecting','asking the hub on localhost:21012 — allow this page in the hub\'s window');
  try{
    const reg=await call('samp.webhub.register',[{ 'samp.name':'Known Universe', 'samp.description.text':'3D map and telescope view of the known universe', 'samp.description.html':'<b>Known Universe</b>' }], 60000);
    SAMP.key=reg['samp.private-key']; SAMP.self=reg['samp.self-id']; SAMP.hub=reg['samp.hub-id'];
    await call('samp.webhub.declareMetadata',[SAMP.key,{ 'samp.name':'Known Universe', 'samp.description.text':'3D map and telescope view of the known universe', 'author.name':'Known Universe' }]);
    await call('samp.webhub.declareSubscriptions',[SAMP.key,{ 'coord.pointAt.sky':{}, 'samp.hub.event.shutdown':{}, 'samp.hub.disconnect':{}, 'samp.app.ping':{} }]);
    await call('samp.webhub.allowReverseCallbacks',[SAMP.key,'1']);
    try{ const cl=await call('samp.webhub.getRegisteredClients',[SAMP.key]); SAMP.clients=Array.isArray(cl)?cl.filter(c=>c!==SAMP.self&&c!==SAMP.hub).length:0; }catch(_){}
    publish('on',`connected · ${SAMP.clients} other client${SAMP.clients===1?'':'s'} on the hub`);
    poll();
    return true;
  }catch(e){ SAMP.key=null; publish('error', e.name==='AbortError' ? 'no hub answered on localhost:21012 (start TOPCAT or Aladin first)' : 'SAMP: '+(e.message||e)); return false; }
}
export async function sampDisconnect(){
  const k=SAMP.key; SAMP.key=null; SAMP.polling=false;
  if(k){ try{ await call('samp.webhub.unregister',[k]); }catch(_){} }
  publish('off','disconnected');
}
// ---- incoming: long-poll the hub for callbacks ----
async function poll(){
  if(SAMP.polling) return; SAMP.polling=true;
  while(SAMP.key){
    let cbs=null;
    try{ cbs=await call('samp.webhub.pullCallbacks',[SAMP.key,'10'], 15000); }
    catch(e){ if(!SAMP.key) break; if(e.name!=='AbortError'){ SAMP.key=null; publish('error','hub went away: '+(e.message||e)); break; } continue; }
    if(!Array.isArray(cbs)) continue;
    for(const cb of cbs){ try{ await handle(cb); }catch(_){} }
  }
  SAMP.polling=false;
}
async function handle(cb){
  const m=cb['samp.methodName'], p=cb['samp.params']||[];
  if(m!=='receiveNotification'&&m!=='receiveCall') return;
  const msg=m==='receiveCall'?p[2]:p[1], msgId=m==='receiveCall'?p[1]:null, mt=msg&&msg['samp.mtype'], prm=(msg&&msg['samp.params'])||{};
  let result={};
  if(mt==='coord.pointAt.sky'){ const ra=+prm.ra, dec=+prm.dec; if(isFinite(ra)&&isFinite(dec)){ if(!S.skyMode) api.skyView?.(true); lookAt(ra,dec); SAMP.received++; publish('on',`hub client pointed us at RA ${ra.toFixed(4)}° Dec ${dec.toFixed(4)}°`); } }
  else if(mt==='samp.hub.event.shutdown'||mt==='samp.hub.disconnect'){ SAMP.key=null; publish('off','the hub shut down'); return; }
  else if(mt==='samp.app.ping'){ /* alive */ }
  if(msgId) await call('samp.webhub.reply',[SAMP.key,msgId,{ 'samp.status':'samp.ok', 'samp.result':result }]);
}
// ---- outgoing ----
export async function sampPointAt(){
  if(!SAMP.key) return false;
  const [ra,dec]=fieldCentre();
  await call('samp.webhub.notifyAll',[SAMP.key,{ 'samp.mtype':'coord.pointAt.sky', 'samp.params':{ ra:ra.toFixed(6), dec:dec.toFixed(6) } }]);
  SAMP.sent++; publish('on',`sent coord.pointAt.sky RA ${ra.toFixed(4)}° Dec ${dec.toFixed(4)}°`); return true;
}
// The Web Profile has no upload: a table travels as a URL the hub fetches. This page has no
// server, so the VOTable goes as a data: URL — JSAMP-based hubs (TOPCAT, Aladin) resolve
// those; if a hub does not, the pane's export buttons give the same file to load by hand.
export async function sampSendSet(k){
  if(!SAMP.key) return false; const st=USER.sets[k]; if(!st) return false;
  const text=exportTable('set','votable',k,{ text:true });
  const url='data:application/x-votable+xml;base64,'+btoa(unescape(encodeURIComponent(text)));
  await call('samp.webhub.notifyAll',[SAMP.key,{ 'samp.mtype':'table.load.votable', 'samp.params':{ url, 'table-id':'ku-set-'+k+'-'+Date.now(), name:st.name } }]);
  SAMP.sent++; publish('on',`sent "${st.name}" (${st.rows.length} rows) as table.load.votable`); return true;
}
export const sampVotable=votableOf;
Object.assign(api,{ sampConnect, sampDisconnect, sampPointAt, sampSendSet });
