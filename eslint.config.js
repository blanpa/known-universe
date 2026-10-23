// Minimal lint: the point is `no-undef` — the engine is being split into ES modules, and
// an identifier that silently became a global is exactly the bug a build cannot catch.
import globals from 'globals';
export default [
  { ignores: ['site/**', 'dist/**', 'dist-artifact/**', 'node_modules/**'] },
  {
    files: ['src/**/*.js', 'tools/**/*.mjs'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, __BUILD__: 'readonly' } },
    rules: { 'no-undef': 'error', 'no-import-assign': 'error', 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }] },
  },
];
