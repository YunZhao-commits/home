<template>
  <footer id="footer">
    <div class="terminal-bar">
      <span class="seg">
        <i class="dot" />
        STATUS: SECURE &amp; ENCRYPTED
      </span>
      <span class="pipe" aria-hidden="true">|</span>
      <span class="seg node">NODE: CLOUDFLARE EDGE</span>
      <span class="pipe" aria-hidden="true">|</span>
      <span class="seg copy">&copy;&nbsp;2026&nbsp;191607.XYZ</span>
    </div>
  </footer>
</template>

<script setup>
// Stateless terminal footer — zero store, zero API, zero dependencies.
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  pointer-events: none;
  word-break: keep-all;
  white-space: nowrap;

  .terminal-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
  }

  .seg {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  // 呼吸绿点 — secure 状态指示
  .dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #00ff88;
    box-shadow: 0 0 6px 1px rgba(0, 255, 136, 0.7);
    flex-shrink: 0;
    animation: pulse-dot 2.4s ease-in-out infinite;
  }

  .pipe {
    opacity: 0.2;
  }

  // NODE 段：稍亮
  .node {
    color: rgba(255, 255, 255, 0.28);
  }

  // 版权段：最亮
  .copy {
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.08em;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px 1px rgba(0, 255, 136, 0.7); }
    50%       { opacity: 0.35; box-shadow: 0 0 3px 0   rgba(0, 255, 136, 0.3); }
  }

  // 移动端：只保留版权段
  @media (max-width: 560px) {
    .seg:not(.copy),
    .pipe { display: none; }
    .copy { color: rgba(255, 255, 255, 0.4); }
  }

  @media (max-width: 720px) {
    .terminal-bar {
      font-size: 9px;
      gap: 7px;
    }
  }
}
</style>
