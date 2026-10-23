<script>
  // The card for whatever is hovered or pinned. The engine publishes a plain
  // description (entity.card) and the abilities; the buttons call back through api.
  import { api } from '../lib/api.js';
  import { selection } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  import { reserve } from '../lib/reserve.js';
  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
  const KIND = { gpick: 'Catalogue point', cluster: 'Cluster', pulsar: 'Pulsar', lagrange: 'Lagrange point',
    cme: 'Solar storm', route: 'Interstellar route', transfer: 'Transfer orbit', spot: 'Active region',
    satellite: 'Satellite', fireball: 'Fireball', sun: 'Star', planet: 'Planet', dwarf: 'Dwarf planet',
    moon: 'Moon', tno: 'Trans-Neptunian object', probe: 'Spacecraft', comet: 'Comet', asteroid: 'Asteroid',
    iso: 'Interstellar object', neo: 'Near-Earth object', dso: 'Deep-sky object', sgra: 'Black hole',
    exoplanet: 'Exoplanet', galaxy: 'Galaxy', star: 'Star', host: 'Exoplanet host' };
</script>

{#if $selection}
  {@const s = $selection}
  {@const c = s.card}
  <section class="panel info" id="info" class:pinned={s.pinned} aria-live="polite" use:reserve={'info'}>
    <header class="in-h">
      <span class="in-dot" style="background:{rgb(c.color)};box-shadow:0 0 10px {rgb(c.color)}"></span>
      <div class="in-t">
        <div class="in-name">{c.title}</div>
        <div class="in-kind">{c.kindLabel ?? KIND[c.kind] ?? c.kind}</div>
      </div>
      {#if s.pinned}
        <button type="button" class="ib" aria-label="Release" title="Release (Esc)" onclick={() => api.deselect()}><Icon name="close" size={15} /></button>
      {/if}
    </header>

    <dl class="in-rows">
      {#each c.rows as [k, v] (k + v)}
        <dt>{k}</dt><dd class:acc={k === 'Instrument'} style={k === 'Instrument' && c.instrumentColor ? `color:${rgb(c.instrumentColor)}` : ''}>{v}</dd>
      {/each}
    </dl>

    {#if c.planets}
      <div class="in-sub">{c.planetsTotal} planet{c.planetsTotal === 1 ? '' : 's'}</div>
      <ul class="in-planets">
        {#each c.planets as p (p.n)}
          <li><b>{p.n}</b><span>{p.y}{p.y && p.extra ? ' · ' : ''}{p.extra}</span></li>
        {/each}
        {#if c.planetsTotal > c.planets.length}<li class="more">… and {c.planetsTotal - c.planets.length} more</li>{/if}
      </ul>
    {/if}

    {#if c.links.length}
      <div class="in-links">
        {#each c.links as l (l.u)}<a href={l.u} target="_blank" rel="noopener">{l.t}</a>{/each}
      </div>
    {/if}

    {#if s.lockable || s.navigable || s.routable || s.transferable}
      <div class="in-actions" role="group" aria-label="Actions">
        {#if s.lockable}
          <button type="button" class:on={s.locked} onclick={() => api.lock()} title="Keep it centred while you zoom">
            <Icon name={s.locked ? 'unlock' : 'lock'} size={14} />{s.locked ? 'Unlock' : 'Lock'}</button>
        {/if}
        {#if s.navigable}
          <button type="button" class:on={s.isNav} onclick={() => s.isNav ? api.clearCourse() : api.setCourse()} title="Set a course and see distance, light time and bearing">
            <Icon name={s.isNav ? 'check' : 'scope'} size={14} />{s.isNav ? 'Course set' : 'Course'}</button>
        {/if}
        {#if s.routable}
          <button type="button" class:on={s.routeOn} onclick={() => api.route()} title="A 1 g starship from Earth: how long would it take?">
            <Icon name="probe" size={14} />{s.routeOn ? 'Clear route' : '1 g route'}</button>
        {/if}
        {#if s.transferable}
          <button type="button" class:on={s.transferOn} onclick={() => api.transfer()} title="Minimum-Δv transfer orbit from Earth">
            <Icon name="probe" size={14} />{s.transferOn ? 'Clear transfer' : 'Transfer'}</button>
        {/if}
      </div>
    {/if}
    {#if c.hint}<div class="in-hint">{c.hint}</div>{/if}
  </section>
{/if}
