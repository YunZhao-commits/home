<template>
  <div class="set" @mouseenter="closeShow = true" @mouseleave="closeShow = false" @click.stop>
    <transition name="el-fade-in-linear">
      <close-one
        class="close"
        theme="filled"
        size="28"
        fill="#ffffff80"
        v-show="closeShow"
        @click="store.setOpenState = false"
      />
    </transition>
    <el-row :gutter="40">
      <el-col :span="12" class="left">
        <div class="logo text-hidden">
          <span class="bg">Yunchu</span>
          <span class="sm">.Studio</span>
        </div>
        <div class="version">
          <div class="num">EDGE NODE v{{ config.version }}</div>
        </div>
        
        <el-card class="update sys-monitor">
          <template #header>
            <div class="card-header">
              <span class="pulse-dot"></span>
              <span class="title-text">System Status / 节点状态</span>
            </div>
          </template>
          <div class="upnote monitor-content">
            <div class="status-item">
              <span class="label">SECURE LINK</span>
              <span class="value green">ESTABLISHED</span>
            </div>
            <div class="status-item">
              <span class="label">UPTIME</span>
              <span class="value">99.99%</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="github-matrix">
              <div class="matrix-header">
                <span class="label">CODE CONTRIBUTIONS</span>
                <span class="user-id">@YunZhao-commits</span>
              </div>
              <div class="matrix-chart">
                <img src="https://ghchart.rshah.org/4ade80/YunZhao-commits" alt="Github Chart" />
              </div>
            </div>

          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12" class="right">
        <div class="title">
          <setting-two theme="filled" size="28" fill="#ffffff80" />
          <span class="name">系统配置 / CONFIGURATION</span>
        </div>
        <Set />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { CloseOne, SettingTwo } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import Set from "@/components/Set.vue";
import config from "@/../package.json";
import { ref } from "vue";

const store = mainStore();
const closeShow = ref(false);
</script>

<style lang="scss" scoped>
/* 💎 全局暗黑拟态毛玻璃背景 💎 */
.set {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: rgba(18, 18, 25, 0.85); 
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 40px;
  color: #fff;

  .close {
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover { transform: scale(1.2) rotate(90deg); fill: #f87171; }
  }

  .el-row {
    height: 100%;
    flex-wrap: nowrap;

    .left {
      height: 100%;
      padding-left: 20px !important;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .logo {
        font-family: "Pacifico-Regular", sans-serif;
        margin-bottom: 20px;
        .bg { font-size: 4rem; text-shadow: 0 0 20px rgba(255,255,255,0.2); }
        .sm { font-size: 1.5rem; opacity: 0.8; }
      }

      .version {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1.2rem;
        color: #60a5fa;
        letter-spacing: 2px;
        margin-bottom: 20px;
      }

      /* 🚀 监控面板样式 🚀 */
      .sys-monitor {
        flex: 1;
        background: rgba(0, 0, 0, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px;
        
        .card-header {
          display: flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          color: rgba(255,255,255,0.8);
          font-weight: bold;
          
          .pulse-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #4ade80; margin-right: 10px;
            box-shadow: 0 0 10px #4ade80;
            animation: pulse 2s infinite;
          }
        }

        .monitor-content {
          padding: 10px;
          font-family: 'JetBrains Mono', monospace;
          
          .status-item {
            display: flex; justify-content: space-between;
            margin-bottom: 12px; font-size: 0.9rem;
            .label { color: rgba(255,255,255,0.5); }
            .value { color: #fff; font-weight: bold; }
            .value.green { color: #4ade80; text-shadow: 0 0 5px rgba(74,222,128,0.4); }
          }

          .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 15px 0; }

          /* 🟩 GitHub 绿墙样式 🟩 */
          .github-matrix {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);

            .matrix-header {
              display: flex; justify-content: space-between;
              font-size: 0.75rem; margin-bottom: 10px;
              .label { color: rgba(255,255,255,0.5); }
              .user-id { color: #4ade80; font-weight: bold; }
            }

            .matrix-chart {
              width: 100%;
              overflow: hidden;
              img {
                width: 100%;
                /* 增加轻微的发光滤镜，强化赛博朋克质感 */
                filter: drop-shadow(0 0 3px rgba(74, 222, 128, 0.3)) hue-rotate(0deg);
                opacity: 0.9;
              }
            }
          }
        }
      }
    }

    .right {
      height: 100%;
      padding-right: 20px !important;
      display: flex;
      flex-direction: column;

      .title {
        display: flex; align-items: center; margin-bottom: 24px;
        font-family: 'JetBrains Mono', monospace; font-size: 1.1rem;
        letter-spacing: 1px; color: rgba(255,255,255,0.9);
        .i-icon { margin-right: 10px; }
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 15px #4ade80; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* 🔪 屏蔽多余配置 🔪 */
:deep(.el-card) { background: transparent !important; border: none !important; color: #fff !important; }
:deep(.el-collapse) { border: none !important; }
:deep(.el-collapse-item__header) {
  background: rgba(255,255,255,0.05) !important; color: #fff !important;
  border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px; margin-bottom: 10px; padding: 0 15px;
}
:deep(.el-collapse-item__wrap) { background: transparent !important; border: none !important; }
</style>
