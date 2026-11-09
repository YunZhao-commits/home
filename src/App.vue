<template>
  <div
    class="cyber-cursor"
    :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
    :class="{ active: isHovering }"
  ></div>

  <canvas id="particle-canvas" class="particle-bg"></canvas>

  <CommandPalette />

  <Background />

  <main id="main">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>

    <Transition name="fade" mode="out-in">
      <Footer
        class="f-ter"
        v-if="
          !store.backgroundShow &&
          !store.setOpenState &&
          !['Home', 'ShareList', 'ShareDetail', 'Notes', 'About', 'Admin'].includes(router.currentRoute.value.name)
        "
      />
    </Transition>
  </main>

  <AiWidget
    v-if="
      !['Home', 'ShareList', 'ShareDetail', 'Notes', 'About', 'Admin'].includes(
        router.currentRoute.value.name,
      )
    "
  />
</template>

<script setup>
import AiWidget from '@/components/AiWidget.vue';
import { mainStore } from "@/store";

import Background from "@/components/Background.vue";
import Footer from "@/components/Footer.vue";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import CommandPalette from "@/components/CommandPalette.vue";
import router from "@/router";

const store = mainStore();

const cursorX = ref(-100);
const cursorY = ref(-100);
const isHovering = ref(false);

const getWidth = () => { store.setInnerWidth(window.innerWidth); };


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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
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

  window.addEventListener("mousemove", (e) => {
    cursorX.value = e.clientX;
    cursorY.value = e.clientY;
    const target = e.target;
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

<style lang="scss" scoped>
.cyber-cursor {
  position: fixed;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
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

  @media (max-width: 720px) {
    position: fixed;
    inset: 0;
    width: 100%;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }

  .f-ter {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 2;
  }
}
</style>
