// A minimal SAMP Web Profile hub, enough to check this app's client against the protocol:
// XML-RPC over HTTP on localhost:21012 with CORS, a long-polling pullCallbacks, a record
// of every call. Used by the e2e run (no Java, so no TOPCAT here) and by hand:
//   node tools/samp-mockhub.mjs   # prints calls as JSON lines
import { createServer } from 'node:http';
// ---- the XML-RPC subset SAMP uses: string, int, struct, array ----
function tokens(xml) { return xml.replace(/<\?xml[^>]*\?>/, '').match(/<[^>]+>|[^<]+/g).map(t => t.trim()).filter(Boolean); }
function parseValue(tk, i) {                                     // at '<value>' → [value, nextIndex]
  if (tk[i] !== '<value>') throw new Error('expected <value> at ' + tk[i]);
  i++;
  if (tk[i] === '</value>') return ['', i + 1];
  const tag = tk[i];
  if (tag === '<string>' || tag === '<int>' || tag === '<i4>' || tag === '<double>' || tag === '<boolean>') {
    const close = tag.replace('<', '</'); const txt = tk[i + 1] === close ? '' : tk[i + 1]; i += tk[i + 1] === close ? 2 : 3;
    if (tk[i] !== '</value>') throw new Error('bad scalar'); return [txt.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'), i + 1]; }
  if (tag === '<struct>') { const o = {}; i++;
    while (tk[i] === '<member>') { i++; if (tk[i] !== '<name>') throw new Error('bad member'); const name = tk[i + 2] === '</name>' ? tk[i + 1] : ''; i += tk[i + 1] === '</name>' ? 2 : 3;
      const [v, j] = parseValue(tk, i); o[name] = v; i = j; if (tk[i] !== '</member>') throw new Error('bad member end'); i++; }
    if (tk[i] !== '</struct>' || tk[i + 1] !== '</value>') throw new Error('bad struct end'); return [o, i + 2]; }
  if (tag === '<array>') { const a = []; i += 2; if (tk[i - 1] !== '<data>') throw new Error('bad array');
    while (tk[i] === '<value>') { const [v, j] = parseValue(tk, i); a.push(v); i = j; }
    if (tk[i] !== '</data>' || tk[i + 1] !== '</array>' || tk[i + 2] !== '</value>') throw new Error('bad array end'); return [a, i + 3]; }
  // bare text
  const txt = tag; if (tk[i + 1] !== '</value>') throw new Error('bad bare value'); return [txt, i + 2];
}
export function parseCall(xml) {
  const tk = tokens(xml); const mi = tk.indexOf('<methodName>'); const method = tk[mi + 1];
  const params = []; let i = tk.indexOf('<params>') + 1;
  while (tk[i] === '<param>') { const [v, j] = parseValue(tk, i + 1); params.push(v); i = j; if (tk[i] !== '</param>') throw new Error('bad param'); i++; }
  return { method, params };
}
const xesc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const enc = v => Array.isArray(v) ? `<value><array><data>${v.map(enc).join('')}</data></array></value>` : (v && typeof v === 'object') ? `<value><struct>${Object.entries(v).map(([k, x]) => `<member><name>${xesc(k)}</name>${enc(x)}</member>`).join('')}</struct></value>` : `<value><string>${xesc(v)}</string></value>`;
const reply = v => `<?xml version="1.0"?><methodResponse><params><param>${enc(v)}</param></params></methodResponse>`;
export function startMockHub({ port = 21012, log = false, pollMs = 1500 } = {}) {
  const calls = [], queue = []; let waiting = null, waitTimer = null;
  const flush = () => { if (waiting) { const w = waiting; waiting = null; clearTimeout(waitTimer); w(queue.splice(0)); } };
  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      let c; try { c = parseCall(body); } catch (e) { calls.push({ method: 'PARSE-ERROR', error: e.message, body: body.slice(0, 300) }); res.statusCode = 400; return res.end('bad xml-rpc'); }
      calls.push(c); if (log) console.log(JSON.stringify(c));
      res.setHeader('Content-Type', 'text/xml');
      const { method } = c;
      if (method === 'samp.webhub.register') return res.end(reply({ 'samp.private-key': 'k-mock', 'samp.hub-id': 'hub', 'samp.self-id': 'c1', 'samp.url-translator': `http://localhost:${port}/translate?` }));
      if (method === 'samp.webhub.pullCallbacks') { if (queue.length) return res.end(reply(queue.splice(0)));
        waiting = cbs => res.end(reply(cbs)); waitTimer = setTimeout(flush, pollMs); return; }
      if (method === 'samp.webhub.getRegisteredClients') return res.end(reply(['hub', 'c2']));
      if (method === 'samp.webhub.getSubscribedClients') return res.end(reply({ c2: {} }));
      if (method === 'samp.webhub.getMetadata') return res.end(reply({ 'samp.name': 'topcat-mock' }));
      return res.end(reply('ok'));
    });
  });
  server.listen(port, '127.0.0.1');
  return { calls, port,
    notify(message, sender = 'c2') { queue.push({ 'samp.methodName': 'receiveNotification', 'samp.params': [sender, message] }); flush(); },
    call(message, msgId = 'm1', sender = 'c2') { queue.push({ 'samp.methodName': 'receiveCall', 'samp.params': [sender, msgId, message] }); flush(); },
    close() { flush(); server.close(); } };
}
if (process.argv[1] && process.argv[1].endsWith('samp-mockhub.mjs')) { startMockHub({ log: true }); console.log('mock SAMP hub on http://localhost:21012/'); }
