<template>
  <div
    class="cyber-cursor"
    :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
    :class="{ active: isHovering }"
  ></div>

  <canvas id="particle-canvas" class="particle-bg"></canvas>

  <CommandPalette />

  <Loading />

  <Background @loadComplete="loadComplete" />
  
  <Transition name="fade" mode="out-in">
    <main id="main" v-if="store.imgLoadStatus">
      <div class="container" v-show="!store.backgroundShow">
        <section class="all" v-show="!store.setOpenState">
          <MainLeft />
          <MainRight v-show="!store.boxOpenState" />
          <Box v-show="store.boxOpenState" />
        </section>
        <section class="more" v-show="store.setOpenState" @click="store.setOpenState = false">
          <MoreSet />
        </section>
      </div>
      
      <Icon
        class="menu glass-btn"
        size="24"
        v-show="!store.backgroundShow"
        @click="store.mobileOpenState = !store.mobileOpenState"
      >
        <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
      </Icon>

      <Transition name="fade" mode="out-in">
        <Footer class="f-ter" v-show="!store.backgroundShow && !store.setOpenState" />
      </Transition>
    </main>
  </Transition>
  
  <AiWidget />
</template>

<script setup>
import AiWidget from '@/components/AiWidget.vue';
import { helloInit, checkDays } from "@/utils/getTime.js";import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import Icon from "@/components/Icon.vue";
import { mainStore } from "@/store";

import Loading from "@/components/Loading.vue";
import MainLeft from "@/views/Main/Left.vue";
import MainRight from "@/views/Main/Right.vue";
import Background from "@/components/Background.vue";
import Footer from "@/components/Footer.vue";
import Box from "@/views/Box/index.vue";
import MoreSet from "@/views/MoreSet/index.vue";
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import CommandPalette from "@/components/CommandPalette.vue";

const store = mainStore();

const cursorX = ref(-100);
const cursorY = ref(-100);
const isHovering = ref(false);

const getWidth = () => { store.setInnerWidth(window.innerWidth); };

const loadComplete = () => {
  nextTick(() => {
    helloInit();
    checkDays();
  });
};

watch(
  () => store.innerWidth,
  (value) => {
    if (value < 721) {
      store.boxOpenState = false;
      store.setOpenState = false;
    }
  },
);

const initParticles = () => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  let particles = [];

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  for(let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 0.5
    });
  }

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0 || p.x > width) p.vx *= -1;
      if(p.y < 0 || p.y > height) p.vy *= -1;
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    });
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.5;
    for(let i = 0; i < particles.length; i++) {
      for(let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
};

onMounted(() => {
  initParticles();

  // 无条件监听鼠标移动，只要你动鼠标，圈圈就跟着走
  window.addEventListener("mousemove", (e) => {
    cursorX.value = e.clientX;
    cursorY.value = e.clientY;
    const target = e.target;
    // 监听各种可点击元素，实现圈圈放大效果
    if (
      target.closest("a") ||
      target.closest("button") ||
      target.closest(".item") ||
      target.closest(".cards") ||
      target.closest(".logo")
    ) {
      isHovering.value = true;
    } else {
      isHovering.value = false;
    }
  });

  window.addEventListener("mousedown", (event) => {
    if (event.button == 1) {
      store.backgroundShow = !store.backgroundShow;
    }
  });

  getWidth();
  window.addEventListener("resize", getWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", getWidth);
});
</script>

<style>
/* 仅在电脑端（屏幕宽度 >= 768px）隐藏系统原生鼠标箭头 */
@media (min-width: 768px) {
  /* cursor handled inline by main.js after mount */
}
</style>

<style lang="scss" scoped>
.cyber-cursor {
  position: fixed;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
  z-index: 99999;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);

  &.active {
    width: 45px;
    height: 45px;
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(4px);
    border-color: transparent;
  }

  /* 在手机端（屏幕宽度 < 768px）彻底隐藏这个圈圈，防止卡在屏幕上 */
  @media (max-width: 767px) {
    display: none !important;
  }
}

.particle-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

#main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  height: 100%;
  transform: scale(1.2);
  transition: transform 0.3s;
  animation: fade-blur-main-in 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: 0.5s;
  z-index: 1;

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
    bottom: max(20px, env(safe-area-inset-bottom, 20px));
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

    .i-icon {
      transform: translateY(2px);
    }

    @media (min-width: 721px) {
      display: none;
    }
  }

  @media (max-width: 720px) {
    // 移动端强制单列布局，覆盖所有嵌套选择器
    .container {
      padding: 0 !important;
    }
    .container .all,
    .all {
      flex-direction: column !important;
      align-items: stretch !important;
      padding: 0 0.5rem !important;
      gap: 1rem;
    }
    // 防止内容溢出产生横向滚动条
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
  }

  @media (max-height: 720px) {
    overflow-y: auto;
    overflow-x: hidden;

    .container {
      height: 721px;
      padding-left: 0.7vw;
      padding-right: 0.25vw;

      .more {
        height: 721px;
        width: 100%;
      }

      @media (max-width: 1200px) { padding-left: 2.3vw; padding-right: 1.75vw; }
      @media (max-width: 1100px) { padding-left: 2vw;   padding-right: 2vw;    }
      @media (max-width: 992px)  { padding-left: 2.3vw; padding-right: 1.7vw;  }
      @media (max-width: 900px)  { padding-left: 2vw;   padding-right: 2vw;    }
    }

    .f-ter {
      top: 675px;
      @media (min-width: 391px) { padding-left: 6px; }
    }
  }

  @media (max-width: 390px) {
    overflow-x: auto;

    .container { width: 100%; min-width: 320px; }

    .f-ter { width: 100%; min-width: 320px; }

    @media (min-height: 721px) { overflow-y: hidden; }
  }
}
</style>
