<div class="panel" id="hud-time">
    <div class="time-head">
      <div class="yr">Year <span class="live" id="yrVal">2026</span></div>
      <div class="meta" id="yrMeta"></div>
      <div class="time-min" title="Minimize">–</div>
    </div>
    <div class="time-row">
      <button id="play" aria-label="Play time"><svg id="playIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"/></svg></button>
      <div class="track">
        <input type="range" id="year" min="1992" max="2026" value="2026" step="1">
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
      <button id="solPlay" aria-label="Play time"><svg id="solIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"/></svg></button>
      <div class="track">
        <input type="range" id="solTime" min="-36525" max="36525" value="0" step="1">
        <div class="ticks"><span>−100 yr</span><span>−50</span><span>today</span><span>+50</span><span>+100 yr</span></div>
      </div>
      <button id="solNow">today</button>
    </div>
  </div>
