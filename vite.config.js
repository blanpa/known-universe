import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',                        // GitHub Pages serves from a sub-path
  publicDir: false,                  // site/data is managed outside the bundle
  build: { outDir: 'dist', emptyOutDir: true, minify: false },  // unminified: testable + diffable
});
