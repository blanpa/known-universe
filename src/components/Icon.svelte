<script module>
  export { ICONS } from '../lib/icons.js';
</script>

<script>
  import { ICONS } from '../lib/icons.js';
  let { name, size = 16, stroke = 1.6, fill = 'none', label = null } = $props();
</script>

<svg class="ic" viewBox="0 0 24 24" width={size} height={size} fill={fill}
     stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round"
     aria-hidden={label ? undefined : 'true'} role={label ? 'img' : undefined} aria-label={label}
>{@html ICONS[name] ?? ''}</svg>

<style>
  .ic { flex: 0 0 auto; display: block; }
</style>
