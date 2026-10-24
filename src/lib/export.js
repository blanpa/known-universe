// Tables out of the app: CSV and VOTable 1.4 from plain rows. Pure functions, so the
// e2e run can check them; download() is the only DOM touch.
//
// A column is { k, n, t, u, ucd, d }: key in the row, name in the file, datatype
// ('double' | 'int' | 'char'), unit, UCD, description. Missing values stay empty.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cell = v => v === undefined || v === null || (typeof v === 'number' && !isFinite(v)) ? '' : String(v);
const quote = s => /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
export function csvOf(rows, cols, head = []) {
  const out = head.map(h => '# ' + h);
  out.push(cols.map(c => quote(c.n)).join(','));
  for (const r of rows) out.push(cols.map(c => quote(cell(r[c.k]))).join(','));
  return out.join('\n') + '\n';
}
export function votableOf(rows, cols, meta = {}) {
  const f = cols.map(c => `   <FIELD name="${esc(c.n)}" datatype="${c.t || 'double'}"${c.t === 'char' ? ' arraysize="*"' : ''}${c.u ? ` unit="${esc(c.u)}"` : ''}${c.ucd ? ` ucd="${esc(c.ucd)}"` : ''}>${c.d ? `<DESCRIPTION>${esc(c.d)}</DESCRIPTION>` : ''}</FIELD>`);
  const tr = rows.map(r => '    <TR>' + cols.map(c => `<TD>${esc(cell(r[c.k]))}</TD>`).join('') + '</TR>');
  return `<?xml version="1.0" encoding="UTF-8"?>
<VOTABLE version="1.4" xmlns="http://www.ivoa.net/xml/VOTable/v1.3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <DESCRIPTION>${esc(meta.description || 'Known Universe export')}</DESCRIPTION>
 <COOSYS ID="icrs" system="ICRS" epoch="J${(meta.epoch || 2000).toFixed(1)}"/>
 <RESOURCE type="results">
${(meta.info || []).map(([n, v]) => `  <INFO name="${esc(n)}" value="${esc(v)}"/>`).join('\n')}
  <TABLE name="${esc(meta.name || 'table')}" nrows="${rows.length}">
${f.join('\n')}
   <DATA><TABLEDATA>
${tr.join('\n')}
   </TABLEDATA></DATA>
  </TABLE>
 </RESOURCE>
</VOTABLE>
`;
}
export function download(name, text, mime = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: mime + ';charset=utf-8' }));
  a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
export const safeName = s => String(s || 'table').replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'table';
