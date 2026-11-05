<template>
  <div class="home-wrapper" v-show="!store.backgroundShow">
    <div v-if="!store.setOpenState" class="home-stage">
      <main v-if="!store.mobileOpenState && !store.boxOpenState" class="landing">
        <div class="brand-row">
          <Message />
        </div>

        <div class="feature-grid">
          <section class="quote-and-social" aria-label="Yunchu Studio introduction and social links">
            <Hitokoto />
            <SocialLinks />
          </section>
          <Func />
        </div>

        <div class="share-entry">
          <span class="ornament" aria-hidden="true"><i></i></span>
          <button class="enter-share-btn" type="button" @click="router.push('/share')">
            <span>进入分享</span>
            <span class="arrow" aria-hidden="true">→</span>
          </button>
          <span class="ornament" aria-hidden="true"><i></i></span>
        </div>
      </main>

      <section v-else-if="store.mobileOpenState" class="mobile-menu-view" aria-label="网站导航">
        <MainRight />
      </section>

      <section v-else class="box-view">
        <Box />
      </section>
    </div>

    <section v-else class="more" @click="store.setOpenState = false">
      <MoreSet />
    </section>

    <Icon
      class="menu glass-btn"
      size="24"
      v-show="!store.backgroundShow && !store.setOpenState"
      :aria-label="store.mobileOpenState ? '关闭导航' : '打开导航'"
      @click="store.mobileOpenState = !store.mobileOpenState"
    >
      <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
    </Icon>
  </div>
</template>

<script setup>
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import { useRouter } from "vue-router";
import Icon from "@/components/Icon.vue";
import Message from "@/components/Message.vue";
import Hitokoto from "@/components/Hitokoto.vue";
import SocialLinks from "@/components/SocialLinks.vue";
import Func from "@/views/Func/index.vue";
import MainRight from "@/views/Main/Right.vue";
import Box from "@/views/Box/index.vue";
import MoreSet from "@/views/MoreSet/index.vue";
import { mainStore } from "@/store";

const store = mainStore();
const router = useRouter();
</script>

<style lang="scss" scoped>
.home-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(180deg, rgba(2, 17, 35, 0.12), rgba(1, 22, 38, 0.22)),
    url("/images/hero-starry-lake.webp") center / cover no-repeat;

  .home-stage {
    width: 100%;
    height: 100%;
    min-height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3.5vh 30px;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }

  .landing {
    width: min(1270px, 100%);
    margin: auto;
    transform: translateX(clamp(0px, 1.4vw, 25px));
    animation: fade 0.6s ease both;
  }

  .brand-row {
    width: calc(100% - 332px);
    margin: 0 0 clamp(22px, 4vh, 38px);
    display: flex;
    justify-content: center;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 284px;
    gap: clamp(24px, 3vw, 48px);
    align-items: center;
  }

  .quote-and-social {
    min-width: 0;
  }

  .share-entry {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 22px;
    margin: clamp(30px, 5vh, 48px) auto 0;
    transform: translateX(-25px);
  }

  .ornament {
    width: clamp(55px, 9vw, 142px);
    height: 18px;
    position: relative;
    display: block;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(204, 249, 255, 0.95));
    }

    i {
      position: absolute;
      top: 50%;
      right: 0;
      width: 10px;
      height: 10px;
      transform: translate(50%, -50%) rotate(45deg);
      background: #e9fdff;
      box-shadow: 0 0 16px rgba(126, 243, 255, 0.95);
      clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
    }

    &:last-child {
      transform: scaleX(-1);
    }
  }

  .enter-share-btn {
    min-width: 360px;
    min-height: 78px;
    padding: 0 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    border: 1px solid rgba(181, 251, 255, 0.95);
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(110deg, rgba(0, 205, 205, 0.55), rgba(3, 61, 92, 0.68));
    box-shadow: inset 0 0 18px rgba(111, 255, 255, 0.18), 0 0 22px rgba(38, 226, 240, 0.18);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
    font-size: clamp(22px, 2vw, 32px);
    letter-spacing: 0.24em;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;

    .arrow {
      font-family: Arial, sans-serif;
      font-size: 1.25em;
      letter-spacing: 0;
      transition: transform 0.25s ease;
    }

    &:hover {
      transform: translateY(-2px);
      background: linear-gradient(110deg, rgba(0, 222, 221, 0.72), rgba(4, 78, 112, 0.78));
      box-shadow: inset 0 0 22px rgba(111, 255, 255, 0.24), 0 0 30px rgba(38, 226, 240, 0.33);

      .arrow { transform: translateX(5px); }
    }

    &:active { transform: scale(0.98); }
  }

  .mobile-menu-view {
    width: min(600px, 100%);
    margin: auto;

    :deep(.right) {
      width: 100%;
      max-width: 600px;
      margin: 0;
      padding: 0 2px;
    }
  }

  .box-view {
    width: min(900px, 100%);
    height: min(800px, 90vh);
    margin: auto;
  }

  .more {
    position: fixed;
    inset: 0;
    z-index: 10;
    overflow: auto;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(20px);
    animation: fade 0.35s ease;
  }

  .menu {
    position: fixed;
    z-index: 100;
    display: none;
    left: 50%;
    bottom: max(14px, calc(env(safe-area-inset-bottom, 0px) + 10px));
    transform: translateX(-50%);
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(220, 252, 255, 0.28);
    border-radius: 50%;
    color: #fff;
    background: rgba(3, 25, 43, 0.58);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.26);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;

    &:active { transform: translateX(-50%) scale(0.94); }
  }
}

@media (max-width: 1100px) and (min-width: 721px) {
  .home-wrapper {
    .home-stage { padding: 32px 5vw; }
    .landing { transform: none; }
    .brand-row { width: calc(100% - 284px - 24px); }
    .feature-grid { grid-template-columns: minmax(0, 1fr) 260px; gap: 24px; }
    .enter-share-btn { min-width: 310px; }
  }
}

@media (max-width: 900px) and (min-width: 721px) {
  .home-wrapper {
    .home-stage { align-items: flex-start; }
    .feature-grid { grid-template-columns: 1fr; gap: 18px; }
    .brand-row { width: 100%; }
    .share-entry { margin-top: 26px; }
    .share-entry { transform: none; }
  }
}

@media (max-width: 720px) {
  .home-wrapper {
    .home-stage {
      height: 100%;
      min-height: 100dvh;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 0;
    }

    .landing {
      width: 100%;
      min-height: 100%;
      margin: 0 auto;
      padding: calc(env(safe-area-inset-top, 0px) + 26px) 22px calc(86px + env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
    }

    .landing { transform: none; }
    .brand-row { width: 100%; margin-bottom: 22px; }

    .feature-grid {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }

    .share-entry { margin-top: 25px; gap: 14px; transform: none; }
    .ornament { width: 32px; }

    .enter-share-btn {
      min-width: 0;
      min-height: 58px;
      padding: 0 24px;
      gap: 17px;
      font-size: 21px;
    }

    .menu { display: inline-flex; }
    .mobile-menu-view {
      width: 100%;
      min-height: 100%;
      padding: calc(env(safe-area-inset-top, 0px) + 26px) 20px calc(86px + env(safe-area-inset-bottom, 0px));
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;

      :deep(.right) { padding: 0; }
    }

    .box-view {
      width: 100%;
      height: auto;
      min-height: 100%;
      padding: 20px 14px 80px;
      box-sizing: border-box;
    }
  }
}

@media (max-width: 380px) {
  .home-wrapper {
    .landing { padding-inline: 15px; }
    .share-entry { gap: 8px; }
    .ornament { width: 18px; }
    .enter-share-btn { padding: 0 18px; font-size: 19px; }
  }
}

@media (max-height: 600px) and (orientation: landscape) and (max-width: 900px) {
  .home-wrapper {
    .home-stage { align-items: flex-start; }
    .landing { padding-top: calc(env(safe-area-inset-top, 0px) + 14px); }
    .brand-row { margin-bottom: 16px; }
    .share-entry { margin-top: 16px; }
  }
}
</style>
