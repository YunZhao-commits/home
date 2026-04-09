<template>
  <div class="box-container" @click.stop>
    <div class="close-btn" @click="store.boxOpenState = false">
      <close-small theme="outline" size="24" fill="#ffffff80" />
    </div>
    
    <div class="content">
      <div class="time-capsule">
        <div class="header">
          <hourglass-full theme="outline" size="22" fill="#efefef" />
          <span class="title-text">时光胶囊</span>
        </div>
        
        <div class="progress-list">
          <div class="progress-item" v-for="(item, index) in timeData" :key="index">
            <div class="info-row">
              <div class="name">{{ item.name }}已度过 <span>{{ item.passed }}</span> {{ item.unit }}</div>
              <div class="remaining">剩余 {{ item.remaining }} {{ item.unit }}</div>
            </div>
            <div class="progress-bg">
              <div class="progress-bar" :style="{ width: item.percentage + '%' }"></div>
              <div class="percentage-text">{{ item.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <div class="site-intro">
        <div class="logo">
          <span class="bg">Yunchu</span>
          <span class="sm">Studio</span>
        </div>
        <div class="desc">致力于探索前沿技术与极简设计的个人数字实验室。</div>
        
        <div class="sys-info">
          <div class="info-row">
            <span class="label">CURRENT NODE</span>
            <span class="value">Decentralized Edge</span>
          </div>
          <div class="info-row">
            <span class="label">ACTIVE TASK</span>
            <span class="value">Infrastructure Setup</span>
          </div>
          <div class="info-row">
            <span class="label">NEXT PHASE</span>
            <span class="value">Exploring Web3</span>
          </div>
        </div>
        
        <div class="status-text">-- SYSTEMS ONLINE --</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { CloseSmall, HourglassFull } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import dayjs from "dayjs";

const store = mainStore();
const timeData = ref([]);
let timer = null;

// 核心时间计算引擎 (纯净版，不依赖外部配置，绝不报错白屏)
const updateTime = () => {
  const now = dayjs();
  const today = now.startOf("day");
  const week = now.startOf("week");
  const year = now.startOf("year");
  
  const currentYear = now.year();
  const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;

  timeData.value = [
    {
      name: "今日", unit: "小时",
      passed: now.diff(today, "hour"),
      remaining: 24 - now.diff(today, "hour"),
      percentage: ((now.diff(today, "hour") / 24) * 100).toFixed(2),
    },
    {
      name: "本周", unit: "天",
      passed: now.diff(week, "day") === 0 ? 1 : now.diff(week, "day"),
      remaining: 7 - (now.diff(week, "day") === 0 ? 1 : now.diff(week, "day")),
      percentage: (((now.diff(week, "day") === 0 ? 1 : now.diff(week, "day")) / 7) * 100).toFixed(2),
    },
    {
      name: "本月", unit: "天",
      passed: now.date(),
      remaining: now.daysInMonth() - now.date(),
      percentage: ((now.date() / now.daysInMonth()) * 100).toFixed(2),
    },
    {
      name: "本年", unit: "天",
      passed: now.diff(year, "day"),
      remaining: daysInYear - now.diff(year, "day"),
      percentage: ((now.diff(year, "day") / daysInYear) * 100).toFixed(2),
    },
  ];
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000 * 60 * 30); // 每半小时自动刷新一次进度
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.box-container {
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 25, 0.75);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    transition: transform 0.3s ease;
    z-index: 10;
    &:hover { transform: rotate(90deg) scale(1.1); color: #f87171 !important; }
  }

  .content {
    flex: 1;
    padding: 30px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    
    &::-webkit-scrollbar { width: 0px; }

    /* ⏳ 时光胶囊样式 */
    .time-capsule {
      margin-bottom: 30px;
      .header {
        display: flex; align-items: center; margin-bottom: 20px;
        .title-text { font-size: 18px; color: #fff; margin-left: 8px; font-weight: bold; letter-spacing: 1px; }
      }

      .progress-list {
        .progress-item {
          margin-bottom: 18px;
          .info-row {
            display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;
            .name { color: #fff; span { font-weight: bold; } }
            .remaining { color: rgba(255,255,255,0.6); }
          }
          .progress-bg {
            width: 100%; height: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; position: relative;
            .progress-bar { height: 100%; background: #fff; border-radius: 6px; transition: width 1s ease-out; }
            .percentage-text {
              position: absolute; width: 100%; text-align: center; top: -1px;
              font-size: 10px; color: #1a1a1a; font-weight: bold; font-family: 'JetBrains Mono', monospace;
            }
          }
        }
      }
    }

    /* 🔬 实验室简介样式 */
    .site-intro {
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      padding-top: 25px;

      .logo {
        margin-bottom: 10px;
        .bg { font-family: "Pacifico-Regular", sans-serif; font-size: 28px; color: #fff; margin-right: 5px; }
        .sm { font-size: 18px; color: rgba(255, 255, 255, 0.7); }
      }

      .desc {
        color: rgba(255, 255, 255, 0.7); font-size: 13px; line-height: 1.6;
        margin-bottom: 20px; border-left: 2px solid rgba(255,255,255,0.3); padding-left: 10px;
      }

      .sys-info {
        background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px;
        .info-row {
          display: flex; justify-content: space-between; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px;
          &:last-child { margin-bottom: 0; }
          .label { color: rgba(255, 255, 255, 0.5); }
          .value { color: #fff; font-weight: bold; }
        }
      }

      .status-text {
        text-align: center; margin-top: 20px; font-family: 'JetBrains Mono', monospace;
        font-size: 12px; color: rgba(255, 255, 255, 0.3); letter-spacing: 2px;
      }
    }
  }
}
</style>
