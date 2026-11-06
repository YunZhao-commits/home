<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink class="brand" to="/" aria-label="Yunchu Studio 首页">
        <img class="brand-avatar" src="/images/avatar.png" alt="" />
        <span class="brand-copy">
          <strong>Yunchu Studio</strong>
          <small>云初工作室</small>
        </span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink to="/" :class="{ active: active === 'home' }">首页</RouterLink>
        <RouterLink to="/share" :class="{ active: active === 'share' }">精选分享</RouterLink>
        <RouterLink to="/notes" :class="{ active: active === 'notes' }">笔记</RouterLink>
        <RouterLink to="/about" :class="{ active: active === 'about' }">关于</RouterLink>
      </nav>

      <div class="header-actions">
        <button class="icon-button search-button" type="button" aria-label="搜索精选分享" @click="openSearch">
          <Search theme="outline" size="22" />
        </button>
        <RouterLink class="avatar-link" to="/" aria-label="返回首页">
          <img src="/images/avatar.png" alt="" />
        </RouterLink>
        <button
          class="icon-button menu-button"
          type="button"
          :aria-expanded="menuOpen"
          :aria-label="menuOpen ? '关闭导航菜单' : '打开导航菜单'"
          @click="menuOpen = !menuOpen"
        >
          <component :is="menuOpen ? CloseSmall : HamburgerButton" />
        </button>
      </div>
    </div>

    <Transition name="menu-fade">
      <nav v-if="menuOpen" class="mobile-nav" aria-label="折叠导航">
        <RouterLink to="/" @click="menuOpen = false">首页</RouterLink>
        <RouterLink to="/share" @click="menuOpen = false">精选分享</RouterLink>
        <RouterLink to="/notes" @click="menuOpen = false">笔记</RouterLink>
        <RouterLink to="/about" @click="menuOpen = false">关于本站</RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { Search, HamburgerButton, CloseSmall } from "@icon-park/vue-next";

defineProps({
  active: { type: String, default: "" },
});

const emit = defineEmits(["search"]);
const menuOpen = ref(false);
const route = useRoute();
const router = useRouter();

const openSearch = () => {
  menuOpen.value = false;
  if (route.path === "/share") {
    emit("search");
    return;
  }
  router.push({ path: "/share", query: { focus: "search" } });
};

watch(() => route.fullPath, () => { menuOpen.value = false; });
</script>

<style lang="scss" scoped>
.site-header {
  position: relative;
  z-index: 20;
  width: 100vw;
  margin-left: calc((100% - 100vw) / 2);
  border-bottom: 1px solid rgba(185, 242, 255, 0.22);
  background: rgba(2, 31, 45, 0.58);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: #f5fdff;
}

.header-inner {
  width: calc(100% - 64px);
  max-width: 1440px;
  min-height: 68px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
}

.brand {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.brand-avatar,
.avatar-link img {
  width: 42px;
  height: 42px;
  display: block;
  border: 1px solid rgba(197, 246, 255, 0.68);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 16px rgba(66, 226, 242, 0.16);
}

.brand-copy { display: flex; flex-direction: column; line-height: 1.15; }
.brand-copy strong { font: 600 17px Georgia, "Noto Serif CJK SC", serif; letter-spacing: 0.02em; }
.brand-copy small { margin-top: 5px; color: rgba(231, 250, 255, 0.65); font-size: 10px; letter-spacing: 0.34em; }

.desktop-nav { display: flex; align-items: center; gap: clamp(28px, 5vw, 74px); }
.desktop-nav a,
.mobile-nav a {
  position: relative;
  color: rgba(244, 252, 255, 0.84);
  text-decoration: none;
  transition: color 0.2s ease;
}
.desktop-nav a { padding: 24px 0 21px; font-size: 15px; white-space: nowrap; }
.desktop-nav a:hover,
.desktop-nav a.active { color: #fff; }
.desktop-nav a.active::after {
  content: "";
  position: absolute;
  right: -10px;
  bottom: 13px;
  left: -10px;
  height: 2px;
  border-radius: 2px;
  background: #42e7e8;
  box-shadow: 0 0 12px rgba(66, 231, 232, 0.7);
}

.header-actions { display: flex; justify-content: flex-end; align-items: center; gap: 18px; }
.icon-button {
  width: 36px;
  height: 40px;
  display: inline-grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: #f5fdff;
  cursor: pointer;
}
.icon-button:hover { color: #6df3f1; }
.avatar-link { width: 40px; height: 40px; display: block; }
.avatar-link img { width: 40px; height: 40px; }
.menu-button :deep(svg) { width: 25px; height: 25px; }
.mobile-nav { display: none; }
.menu-fade-enter-active, .menu-fade-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.menu-fade-enter-from, .menu-fade-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 760px) {
  .header-inner {
    width: calc(100% - 36px);
    min-height: 76px;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
  }
  .brand-avatar { width: 48px; height: 48px; }
  .brand-copy strong { font-size: 17px; }
  .desktop-nav, .avatar-link { display: none; }
  .header-actions { gap: 10px; }
  .mobile-nav {
    position: absolute;
    top: calc(100% + 8px);
    right: 16px;
    width: min(260px, calc(100vw - 32px));
    display: grid;
    gap: 2px;
    padding: 10px;
    border: 1px solid rgba(150, 236, 249, 0.32);
    border-radius: 18px;
    background: rgba(3, 34, 48, 0.96);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(18px);
  }
  .mobile-nav a { padding: 13px 14px; border-radius: 10px; }
  .mobile-nav a:hover, .mobile-nav a.router-link-active { color: #6df3f1; background: rgba(84, 222, 230, 0.1); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; }
}
</style>
