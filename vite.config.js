import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createReadStream, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

// `npm run dev` used to show "Error loading data": the app fetches ./data/*, but the
// datasets live in site/data and publicDir is off, so the request hit the SPA fallback
// and got index.html back. Serve them straight off disk in dev — build is unaffected.
function serveSiteData() {
  const root = resolve('site', 'data');
  const TYPES = { '.json': 'application/json', '.bin': 'application/octet-stream',
                  '.jpg': 'image/jpeg', '.png': 'image/png' };
  return {
    name: 'serve-site-data',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/data', (req, res, next) => {
        const rel = decodeURIComponent((req.url || '').split('?')[0]);
        const file = resolve(join(root, rel));
        if (file !== root && !file.startsWith(root + sep)) return next();   // no traversal
        try { if (!statSync(file).isFile()) return next(); } catch { return next(); }
        const ext = file.slice(file.lastIndexOf('.'));
        res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [svelte(), serveSiteData()],
  base: './',                        // GitHub Pages serves from a sub-path
  publicDir: false,                  // site/data is managed outside the bundle
  build: { outDir: 'dist', emptyOutDir: true, minify: false },  // unminified: testable + diffable
  // build stamp shown in the mobile sheet header — verifies which build a phone runs
  define: { __BUILD__: JSON.stringify('b' + new Date().toTimeString().slice(0, 5)) },
});
