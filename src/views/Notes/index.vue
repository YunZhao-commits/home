<template>
  <div class="notes-page">
    <div class="notes-container">
      <SiteHeader active="notes" />
      <section class="notes-intro">
        <p class="eyebrow">YUNCHU STUDIO / NOTES</p>
        <h1>笔记</h1>
        <p class="description">记录值得留下的方法、经验与灵感。</p>
      </section>
      <section class="notes-empty" aria-live="polite">
        <span class="empty-mark" aria-hidden="true">✦</span>
        <h2>笔记正在整理</h2>
        <p>整理完成后，会在这里和你分享。</p>
        <RouterLink to="/share">先看看精选分享 <span aria-hidden="true">→</span></RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import SiteHeader from "@/components/SiteHeader.vue";
</script>

<style lang="scss" scoped>
.notes-page {
  min-height: 100vh;
  color: #f5fcff;
  background: linear-gradient(180deg, rgba(1, 30, 47, 0.34), rgba(0, 28, 43, 0.56)), url("/images/hero-starry-lake.webp") center / cover fixed no-repeat;
}
.notes-container { width: calc(100% - 48px); max-width: 1280px; margin: 0 auto; padding-bottom: 80px; }
.notes-intro { padding: clamp(34px, 6vw, 78px) 8px 20px; }
.eyebrow { margin: 0 0 12px; color: #65e5e7; font: 600 11px/1.4 ui-monospace, monospace; letter-spacing: 0.28em; }
h1 { margin: 0; font: 500 clamp(38px, 5vw, 62px)/1.1 Georgia, "Noto Serif CJK SC", serif; letter-spacing: 0.08em; }
.description { max-width: 680px; margin: 18px 0 0; color: rgba(241, 250, 255, 0.82); font-size: clamp(15px, 1.6vw, 18px); line-height: 1.8; }
.notes-empty { min-height: 310px; display: grid; justify-items: center; align-content: center; padding: 36px 20px; border: 1px solid rgba(165, 235, 248, 0.34); border-radius: 24px; background: rgba(5, 50, 69, 0.5); box-shadow: inset 0 1px rgba(255,255,255,.08), 0 20px 60px rgba(0,0,0,.16); backdrop-filter: blur(18px); text-align: center; }
.empty-mark { width: 54px; height: 54px; display: grid; place-items: center; border: 1px solid rgba(101, 229, 231, .58); border-radius: 50%; color: #72efee; font-size: 24px; }
.notes-empty h2 { margin: 20px 0 8px; font-size: 23px; font-weight: 600; }
.notes-empty p { margin: 0; color: rgba(231, 246, 251, .72); line-height: 1.7; }
.notes-empty a { margin-top: 24px; color: #69eff0; text-decoration: none; }
.notes-empty a span { padding-left: 6px; }
@media (max-width: 760px) { .notes-container { width: 100%; padding-bottom: 56px; } .notes-intro { padding: 34px 22px 18px; } .notes-empty { min-height: 270px; margin: 0 18px; border-radius: 20px; } }
</style>
