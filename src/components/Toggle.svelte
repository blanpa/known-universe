<script>
  // A real switch: <button role="switch"> gives keyboard operation, focus and
  // screen-reader semantics for free — the old <div onclick> gave none of the three.
  // Styling lives in app.css so this and the mobile-sheet copy stay identical.
  let { checked = false, label = '', onchange = () => {} } = $props();
</script>

<button type="button" class="toggle" class:on={checked}
        role="switch" aria-checked={checked} onclick={onchange}>
  <span class="tg-l">{@html label}</span>
  <span class="sw" aria-hidden="true"></span>
</button>
