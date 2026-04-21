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

    // Positioning: fixed so it floats above the scrollable right panel,
    // aligned with the top of the viewport at 6 %.
    position: fixed;
    top: 6%;
    left: 0;
    width: 100%;             // spans full viewport width → perfect centre
    box-sizing: border-box;

    justify-content: center;
    align-items: baseline;
    gap: 0.35em;

    font-family: "Pacifico-Regular", cursive;
    text-align: center;
    cursor: pointer;
    animation: fade 0.5s;
    transition: transform 0.3s;

    &:active { transform: scale(0.95); }

    // "Yunchu" — large, white
    .logo__main {
      font-size: 2.25rem;
      color: #fff;
      letter-spacing: 0.02em;
    }

    // "Studio" — slightly smaller, semi-transparent to match the desktop style
    .logo__sub {
      font-size: 1.4rem;
      color: rgba(255, 255, 255, 0.75);
      letter-spacing: 0.04em;
    }

    // Show only on mobile
    @media (max-width: 720px) {
      display: flex;
    }

    // Short-viewport adjustment (landscape phones)
    @media (max-height: 720px) {
      top: 43.26px; // 721px × 0.06
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
