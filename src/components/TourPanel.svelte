<script>
  import { api } from '../lib/api.js';
  import { tour } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  import { reserve } from '../lib/reserve.js';
</script>

{#if $tour}
  <div class="panel tourp" id="tourPanel" role="dialog" aria-label="Cosmic tour" use:reserve={'tour'}>
    <div class="tp-head">
      <span class="tp-step mono">{$tour.idx + 1} / {$tour.total}</span>
      <span class="tp-title">{$tour.title}</span>
      <button type="button" class="ib" aria-label="End tour" onclick={() => api.tour.end()}><Icon name="close" size={15} /></button>
    </div>
    <p class="tp-text">{$tour.text}</p>
    <div class="tp-nav">
      <button type="button" disabled={$tour.idx === 0} onclick={() => api.tour.prev()}><Icon name="chevron" size={14} /> Back</button>
      <button type="button" class="primary" onclick={() => api.tour.next()}>{$tour.idx + 1 >= $tour.total ? 'Finish' : 'Next'} <Icon name="chevron" size={14} /></button>
    </div>
  </div>
{/if}
