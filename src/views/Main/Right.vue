<template>
  <div :class="store.mobileOpenState ? 'right' : 'right hidden'">

    <!--
      ✅ FIX: Mobile logo
      Removed the domain-split computed (siteUrl[0] / siteUrl[1]) entirely.
      Now displays "Yunchu Studio" in the site's own Pacifico typeface,
      centred above the clock on mobile, hidden on ≥ 721 px where the
      desktop Left panel already shows the full identity.
    -->
    <div class="logo" @click="store.mobileFuncState = !store.mobileFuncState">
      <span class="logo__main">Yunchu</span>
      <span class="logo__sub">Studio</span>
    </div>

    <!-- 功能区 -->
    <Func />
    <!-- 网站链接 -->
    <Link />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import Func from "@/views/Func/index.vue";
import Link from "@/components/Links.vue";

const store = mainStore();
// siteUrl computed removed — no longer needed.
</script>

<style lang="scss" scoped>
.right {
  width: 50%;
  margin-left: 0.75rem;

  // ── Mobile logo ──────────────────────────────────────────────────────────
  .logo {
    // Only visible on mobile (< 721 px); hidden on desktop.
    display: none;

    // Positioning: relative within .right, so it sits naturally above <Func />
    // and scrolls up with content rather than staying fixed over the cards.
    position: relative;
    width: 100%;
    box-sizing: border-box;
    margin: 0 0 1rem 0;

    justify-content: center;
    align-items: baseline;
    gap: 0.35em;

    font-family: "Pacifico-Regular", cursive;
    text-align: center;
    cursor: pointer;
    animation: fade 0.5s;
    transition: transform 0.3s;
    z-index: 2;

    &:active { transform: scale(0.95); }

    // "Yunchu" — large, white
    .logo__main {
      font-size: 2.1rem;
      color: #fff;
      letter-spacing: 0.02em;
    }

    // "Studio" — slightly smaller, semi-transparent to match the desktop style
    .logo__sub {
      font-size: 1.35rem;
      color: rgba(255, 255, 255, 0.75);
      letter-spacing: 0.04em;
    }

    // Show only on mobile
    @media (max-width: 720px) {
      display: flex;
    }

    // Short-viewport adjustment (landscape phones)
    @media (max-height: 500px) and (orientation: landscape) {
      display: none !important;
    }
  }

  // ── Mobile layout ────────────────────────────────────────────────────────
  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;

    &.hidden {
      display: none;
    }

  }
}
</style>
