<template>
  <footer id="footer">
    <div class="terminal-bar">
      <span class="seg">
        <i class="dot" />
        STATUS: SECURE &amp; ENCRYPTED
      </span>
      <span class="pipe" aria-hidden="true">|</span>
      
      <span class="seg node">
        NODE: CLOUDFLARE EDGE
        <span class="ping-badge" :class="pingStatus" v-if="ping !== null">
          [<span class="ping-dot"></span>{{ ping }}ms]
        </span>
        <span class="ping-badge" v-else>
          [ 测速中... ]
        </span>
      </span>
      
      <span class="pipe" aria-hidden="true">|</span>
      <span class="seg copy">&copy;&nbsp;2026&nbsp;191607.XYZ</span>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const ping = ref(null);
const pingStatus = ref('gray'); // 状态：excellent(绿), good(黄), poor(红)
let pingInterval = null;

// ⚡ 极客核心：无痕静默测速
const checkPing = async () => {
  try {
    const start = performance.now();
    // 使用 no-cors 模式，绝对不会跨域报错，且直接探测 Cloudflare 官方最快的 CDN 边缘节点
    await fetch('https://1.1.1.1/cdn-cgi/trace', { mode: 'no-cors', cache: 'no-store' });
    const end = performance.now();
    const latency = Math.round(end - start);
    
    ping.value = latency;
    
    // 动态雷达变色逻辑
    if (latency < 60) {
      pingStatus.value = 'excellent'; // 极速 - 赛博绿
    } else if (latency < 150) {
      pingStatus.value = 'good';      // 正常 - 警示黄
    } else {
      pingStatus.value = 'poor';      // 拥堵 - 危险红
    }
  } catch (error) {
    ping.value = 999;
    pingStatus.value = 'poor';
  }
};

onMounted(() => {
  checkPing(); // 进网页立刻扫描一次
  pingInterval = setInterval(checkPing, 5000); // 之后每 5 秒自动扫描一次，形成跳动的心跳感
});

onBeforeUnmount(() => {
  if (pingInterval) clearInterval(pingInterval); // 离开页面自动销毁，绝不占用多余内存
});
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  pointer-events: none;
  word-break: keep-all;
  white-space: nowrap;

  .terminal-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
  }

  .seg {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  // 呼吸绿点 — secure 状态指示
  .dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #00ff88;
    box-shadow: 0 0 6px 1px rgba(0, 255, 136, 0.7);
    flex-shrink: 0;
    animation: pulse-dot 2.4s ease-in-out infinite;
  }

  .pipe {
    opacity: 0.2;
  }

  // NODE 段基础颜色
  .node {
    color: rgba(255, 255, 255, 0.28);
  }

  // 🚀 动态雷达样式
  .ping-badge {
    margin-left: 4px;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: color 0.3s ease;

    .ping-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      display: inline-block;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    &.excellent {
      color: #4ade80;
      .ping-dot { background: #4ade80; box-shadow: 0 0 5px #4ade80; }
    }
    &.good {
      color: #fbbf24;
      .ping-dot { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; }
    }
    &.poor {
      color: #f87171;
      .ping-dot { background: #f87171; box-shadow: 0 0 5px #f87171; }
    }
  }

  // 版权段
  .copy {
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.08em;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px 1px rgba(0, 255, 136, 0.7); }
    50%       { opacity: 0.35; box-shadow: 0 0 3px 0   rgba(0, 255, 136, 0.3); }
  }

  @media (max-width: 560px) {
    .seg:not(.copy),
    .pipe { display: none; }
    .copy { color: rgba(255, 255, 255, 0.4); }
  }

  @media (max-width: 720px) {
    .terminal-bar {
      font-size: 9px;
      gap: 7px;
    }
  }
}
</style>
