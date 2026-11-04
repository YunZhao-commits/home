<template>
  <div class="home-wrapper" v-show="!store.backgroundShow">
    <div class="container">
      <section class="all" v-show="!store.setOpenState">
        <MainLeft />
        <MainRight v-show="!store.boxOpenState" />
        <Box v-show="store.boxOpenState" />
      </section>
      <section class="more" v-show="store.setOpenState" @click="store.setOpenState = false">
        <MoreSet />
      </section>
    </div>

    <!-- 手机端折叠菜单切换浮动按钮 -->
    <Icon
      class="menu glass-btn"
      size="24"
      v-show="!store.backgroundShow"
      @click="store.mobileOpenState = !store.mobileOpenState"
    >
      <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
    </Icon>
  </div>
</template>

<script setup>
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import Icon from "@/components/Icon.vue";
import { mainStore } from "@/store";
import MainLeft from "@/views/Main/Left.vue";
import MainRight from "@/views/Main/Right.vue";
import Box from "@/views/Box/index.vue";
import MoreSet from "@/views/MoreSet/index.vue";

const store = mainStore();
</script>

<style lang="scss" scoped>
.home-wrapper {
  width: 100%;
  height: 100%;

  .container {
    width: 100%;
    max-width: 100%;
    height: 100vh;
    margin: 0 auto;
    padding: 0 0.5vw;
    box-sizing: border-box;

    .all {
      width: 100%;
      height: 100%;
      padding: 0 0.75rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    .more {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #00000080;
      backdrop-filter: blur(20px);
      z-index: 2;
      animation: fade 0.5s;
    }

    @media (max-width: 1200px) {
      padding: 0 2vw;
    }
  }

  .menu {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    bottom: max(16px, calc(env(safe-area-inset-bottom, 16px) + 4px));
    left: 50%;
    transform: translateX(-50%);
    width: 56px;
    height: 44px;
    background: rgb(0 0 0 / 25%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    transition: transform 0.3s;
    animation: fade 0.5s;
    z-index: 100;

    &.glass-btn {
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    &:active {
      transform: translateX(-50%) scale(0.95);
    }

    @media (min-width: 721px) {
      display: none;
    }
  }

  @media (max-width: 720px) {
    .container {
      padding: 0 !important;
      width: 100%;
      height: auto;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    .container .all,
    .all {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-start !important;
      padding: calc(env(safe-area-inset-top, 16px) + 20px) 16px 16px !important;
      height: auto;
      min-height: auto;
      gap: 1.25rem;
      box-sizing: border-box;
      width: 100%;
    }
  }
}
</style>
