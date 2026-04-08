<template>
  <div class="cyber-cursor" :style="{ left: cursorX + 'px', top: cursorY + 'px' }" :class="{ active: isHovering }"></div>

  <canvas id="particle-canvas" class="particle-bg"></canvas>

  <Loading />
  <Background @loadComplete="loadComplete" />
  
  <Transition name="fade" mode="out-in">
    <main id="main" v-if="store.imgLoadStatus">
      <div class="container glass-container" v-show="!store.backgroundShow">
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

  <div class="player-wrapper" v-show="!store.backgroundShow">
    <APlayer 
      :audio="audioInfo" 
      :fixed="true" 
      :mini="true" 
      :autoplay="false" 
      theme="#ffffff" 
    />
  </div>
</template>

<script setup>
import { helloInit, checkDays } from "@/utils/getTime.js";
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { Icon } from "@vicons/utils";
import Loading from "@/components/Loading.vue";
import MainLeft from "@/views/Main/Left.vue";
import MainRight from "@/views/Main/Right.vue";
import Background from "@/components/Background.vue";
import Footer from "@/components/Footer.vue";
import Box from "@/views/Box/index.vue";
import MoreSet from "@/views/MoreSet/index.vue";
import config from "@/../package.json";
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
// 💥 唤醒沉睡的 APlayer 引擎 💥
import APlayer from '@worstone/vue-aplayer';

const store = mainStore();

// --- 赛博光标状态 ---
const cursorX = ref(-100);
const cursorY = ref(-100);
const isHovering = ref(false);

// --- 音乐播放器数据 ---
const audioInfo = ref({
  name: 'Cyberpunk City',
  artist: 'Yunchu Studio',
  url: 'https://music.163.com/song/media/outer/url?id=1397345903.mp3', // 占位无版权音乐链接，可自行更改
  cover: '/images/avatar.png'
});

// --- 原版页面宽度计算 ---
const getWidth = () => {
  store.setInnerWidth(window.innerWidth);
};

// --- 原版加载完成事件 ---
const loadComplete = () => {
  nextTick(() => {
    helloInit();
    checkDays();
  });
};

// --- 原版监听宽度变化 ---
watch(
  () => store.innerWidth,
  (value) => {
    if (value < 721) {
      store.boxOpenState = false;
      store.setOpenState = false;
    }
  },
);

// 🌌 Canvas 粒子引擎核心逻辑 🌌
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
    
    // 绘制连线
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
  // 启动粒子引擎
  initParticles();

  // 赛博光标追踪逻辑
  window.addEventListener("mousemove", (e) => {
    cursorX.value = e.clientX;
    cursorY.value = e.clientY;
    const target = e.target;
    if (target.closest("a") || target.closest("button") || target.closest(".item") || target.closest(".cards") || target.closest(".aplayer")) {
      isHovering.value = true;
    } else {
      isHovering.value = false;
    }
  });

  // 鼠标中键事件
  window.addEventListener("mousedown", (event) => {
    if (event.button == 1) {
      store.backgroundShow = !store.backgroundShow;
      if (typeof ElMessage !== 'undefined') {
        ElMessage({
          message: `已${store.backgroundShow ? "开启" : "退出"}壁纸展示状态`,
          grouping: true,
        });
      }
    }
  });

  getWidth();
  window.addEventListener("resize", getWidth);

  // 原版控制台输出
  const configVersion = config.version || '4.1.4';
  const configHome = config.home || 'https://imsyy.top';
  const configGithub = config.github || 'https://github.com/imsyy/home';
  console.log(`\n\n版本: ${configVersion}\n主页: ${configHome}\nGithub: ${configGithub}`);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", getWidth);
});
</script>

<style>
body {
  cursor: none !important; 
}
</style>

<style lang="scss" scoped>
/* 💥 赛博光标样式 💥 */
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
  box-shadow: 0 0 10px rgba(255,255,255,0.2);

  &.active {
    width: 45px;
    height: 45px;
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(4px);
    border-color: transparent;
  }
}

/* 🌌 粒子背景样式 🌌 */
.particle-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* 🎵 播放器容器及深度毛玻璃覆写 🎵 */
.player-wrapper {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 999;
  width: 300px; /* 稍微收敛一下宽度，显得更精致 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  
  /* 强制渗透修改 APlayer 的内置亮色样式，打造暗黑毛玻璃质感 */
  :deep(.aplayer) {
    margin: 0;
    background: rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: none !important;
    color: #fff !important;
    font-family: inherit;

    .aplayer-info {
      border-bottom: none !important;
      .aplayer-music {
        .aplayer-title { color: #fff; font-weight: bold; }
        .aplayer-author { color: rgba(255,255,255,0.7); }
      }
      .aplayer-controller {
        .aplayer-time { color: rgba(255,255,255,0.7); }
        .aplayer-time .aplayer-icon path { fill: rgba(255,255,255,0.9); }
        /* 进度条轨道变暗，主进度条变白 */
        .aplayer-bar-wrap .aplayer-bar {
          background: rgba(255,255,255,0.2) !important;
          .aplayer-loaded { background: rgba(255,255,255,0.3) !important; }
          .aplayer-played { background: #fff !important; .aplayer-thumb { background: #fff !important; } }
        }
      }
    }
    .aplayer-pic { background-color: transparent !important; }
    .aplayer-list {
      border: none !important;
      ol li {
        border-top: 1px solid rgba(255,255,255,0.05) !important;
        color: rgba(255,255,255,0.8);
        &:hover { background: rgba(255,255,255,0.1) !important; }
        &.aplayer-list-light { background: rgba(255,255,255,0.15) !important; color: #fff; }
        .aplayer-list-author { color: rgba(255,255,255,0.5); }
      }
    }
  }
}

/* 移除多余的玻璃背景，恢复通透布局 */
#main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(1.2);
  transition: transform 0.3s;
  animation: fade-blur-main-in 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: 0.5s;
  z-index: 1;

  .container {
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    padding: 0 0.5vw;
    /* 💥 已经移除了那个该死的 .glass-container 背景 💥 */

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
    @media (max-width: 1200px) { padding: 0 2vw; }
  }
  
  .menu {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 84%;
    left: calc(50% - 28px);
    width: 56px;
    height: 34px;
    background: rgb(0 0 0 / 20%);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transition: transform 0.3s;
    animation: fade 0.5s;
    
    &.glass-btn {
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    &:active { transform: scale(0.95); }
    .i-icon { transform: translateY(2px); }
    @media (min-width: 721px) { display: none; }
  }

  @media (max-height: 720px) {
    overflow-y: auto;
    overflow-x: hidden;
    .container {
      height: 721px;
      .more { height: 721px; width: calc(100% + 6px); }
      @media (min-width: 391px) {
        padding-left: 0.7vw; padding-right: 0.25vw;
        @media (max-width: 1200px) { padding-left: 2.3vw; padding-right: 1.75vw; }
        @media (max-width: 1100px) { padding-left: 2vw; padding-right: calc(2vw - 6px); }
        @media (max-width: 992px) { padding-left: 2.3vw; padding-right: 1.7vw; }
        @media (max-width: 900px) { padding-left: 2vw; padding-right: calc(2vw - 6px); }
      }
    }
    .menu {
      top: 605.64px; left: 170.5px; 
      @media (min-width: 391px) { left: calc(50% - 25px); }
    }
    .f-ter {
      top: 675px; 
      @media (min-width: 391px) { padding-left: 6px; }
    }
  }
  @media (max-width: 390px) {
    overflow-x: auto;
    .container { width: 391px; }
    .menu { left: 167.5px; }
    .f-ter { width: 391px; }
    @media (min-height: 721px) { overflow-y: hidden; }
  }
}
</style>
