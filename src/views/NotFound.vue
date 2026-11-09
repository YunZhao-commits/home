<template>
  <main class="not-found" aria-labelledby="not-found-title">
    <section class="message">
      <p class="eyebrow">404 · PAGE NOT FOUND</p>
      <h1 id="not-found-title">这个页面暂时找不到</h1>
      <p>链接可能已失效，或页面地址输入有误。</p>
      <nav aria-label="返回导航">
        <RouterLink to="/share">返回精选分享</RouterLink>
        <RouterLink to="/">回到首页</RouterLink>
      </nav>
    </section>
  </main>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.not-found { min-height: 100vh; display: grid; place-items: center; padding: 24px; color: #effbff; }
.message { width: min(100%, 620px); padding: clamp(28px, 7vw, 64px); text-align: center; border: 1px solid rgba(112, 216, 228, .45); border-radius: 24px; background: rgba(6, 47, 64, .78); box-shadow: 0 24px 80px rgba(0, 21, 28, .5); backdrop-filter: blur(18px); }
.eyebrow { color: #80e9e7; font: 600 .8rem Georgia, serif; letter-spacing: .2em; }
h1 { margin: 12px 0; font: 600 clamp(2rem, 7vw, 3rem) Georgia, "Noto Serif CJK SC", serif; }
.message > p:not(.eyebrow) { color: #c7dbe3; line-height: 1.8; }
nav { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
a { padding: 11px 18px; color: #eaffff; text-decoration: none; border: 1px solid rgba(103, 217, 228, .68); border-radius: 999px; }
a:hover, a:focus-visible { background: #18c8c7; color: #032a39; outline: none; }
</style>
