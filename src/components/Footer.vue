<template>
  <footer id="footer">
    <span>&copy; 2026 191607.xyz</span>
  </footer>
</template>

<script setup>
// Stateless footer — no store, no API, no external dependencies.
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 46px;
  line-height: 46px;
  text-align: center;
  z-index: 0;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: rgb(255 255 255 / 55%);
  word-break: keep-all;
  white-space: nowrap;
  pointer-events: none; // 不拦截底部区域点击

  span {
    pointer-events: none;
  }

  @media (max-width: 720px) {
    font-size: 0.8rem;
  }
}
</style>
