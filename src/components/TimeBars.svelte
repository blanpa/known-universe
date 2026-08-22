<script>
  import Icon from './Icon.svelte';
</script>

<div class="panel" id="hud-uni">
  <button type="button" id="uniPlay" aria-label="Play time"><Icon name="play" size={14} /></button>
  <button type="button" id="uniNow" aria-label="Back to today"><Icon name="reset" size={14} /></button>
  <span id="uniVal" class="live">today</span>
  <div class="track" style="flex:1">
    <input type="range" id="uniTime" min="-1000" max="1000" value="0" step="1" aria-label="Time">
  </div>
  <span class="uniCap">−50,000 yr&nbsp;·&nbsp;+50,000 yr</span>
</div>

<!-- legacy bars: the engine still binds to these ids; the unified strip above replaces them -->
<div style="display:none" aria-hidden="true">
  <div class="panel" id="hud-time">
    <div class="time-head">
      <div class="yr">Year <span class="live" id="yrVal">2026</span></div>
      <div class="meta" id="yrMeta"></div>
      <div class="time-min" title="Minimize">–</div>
    </div>
    <div class="time-row">
      <button id="play" aria-label="Play time" tabindex="-1"><svg id="playIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"/></svg></button>
      <div class="track">
        <input type="range" id="year" min="1992" max="2026" value="2026" step="1" tabindex="-1">
        <div class="ticks"><span>1992</span><span>2000</span><span>2009</span><span>2017</span><span>2026</span></div>
      </div>
    </div>
  </div>

  <div class="panel" id="hud-soltime" style="display:none">
    <div class="time-head">
      <div class="yr">Solar system · <span class="live" id="solDate">–</span></div>
      <div class="meta">Time travel · planets on their orbits</div>
      <div class="time-min" title="Minimize">–</div>
    </div>
    <div class="time-row">
      <button id="solPlay" aria-label="Play time" tabindex="-1"><svg id="solIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"/></svg></button>
      <div class="track">
        <input type="range" id="solTime" min="-36525" max="36525" value="0" step="1" tabindex="-1">
        <div class="ticks"><span>−100 yr</span><span>−50</span><span>today</span><span>+50</span><span>+100 yr</span></div>
      </div>
      <button id="solNow" tabindex="-1">today</button>
    </div>
  </div>
</div>
