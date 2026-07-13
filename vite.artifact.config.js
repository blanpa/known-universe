import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

// single self-contained HTML for the Claude Artifact (data injected afterwards)
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  publicDir: false,
  build: { outDir: 'dist-artifact', emptyOutDir: true, minify: false },
  define: { __BUILD__: JSON.stringify('b' + new Date().toTimeString().slice(0, 5)) },
});
