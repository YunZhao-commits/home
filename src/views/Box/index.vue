<template>
  <div class="box card-blur" @click.stop>
    <div class="close" @click="store.boxOpenState = false">
      <close-small theme="outline" size="26" fill="#fff" />
    </div>
    <div class="box-content">
      <div class="time-capsule">
        <div class="title">
          <hourglass-full theme="outline" size="24" fill="#fff" />
          <span>时光胶囊</span>
        </div>
        
        <div class="progress-list">
          <div class="progress-item" v-for="(item, index) in timeData" :key="index">
            <div class="info">
              <span class="name">{{ item.name }}已度过 <strong>{{ item.passed }}</strong> {{ item.unit }}</span>
              <span class="remaining">剩余 {{ item.remaining }} {{ item.unit }}</span>
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
          <span class="main-text">Yunchu</span> <span class="sub-text">Studio</span>
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

const updateTime = () => {
  const now = dayjs();
  const today = now.startOf("day");
  const week = now.startOf("week");
  const month = now.startOf("month");
  const year = now.startOf("year");
  
  const currentYear = now.year();
  const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;
  const daysInMonth = now.daysInMonth();

  let passedDaysInWeek = now.day() === 0 ? 7 : now.day(); 
  
  timeData.value = [
    {
      name: "今日", unit: "小时",
      passed: now.diff(today, "hour"),
      remaining: 24 - now.diff(today, "hour"),
      percentage: ((now.diff(today, "hour") / 24) * 100).toFixed(2),
    },
    {
      name: "本周", unit: "天",
      passed: passedDaysInWeek,
      remaining: 7 - passedDaysInWeek,
      percentage: ((passedDaysInWeek / 7) * 100).toFixed(2),
    },
    {
      name: "本月", unit: "天",
      passed: now.date(),
      remaining: daysInMonth - now.date(),
      percentage: ((now.date() / daysInMonth) * 100).toFixed(2),
    },
    {
      name: "本年", unit: "天",
      passed: now.diff(year, "day"),
      remaining: daysInYear - now.diff(year, "day"),
      percentage: ((now.diff(year, "day") / daysInYear) * 100).toFixed(2),
    }
  ];
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 60000); 
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  position: relative;
  padding: 30px;
  box-sizing: border-box;

  .close {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    opacity: 0.6;
    transition: 0.3s;
    &:hover { opacity: 1; transform: scale(1.2); color: #f87171; }
  }

  .box-content {
    height: 100%;
    overflow-y: auto;
    padding-right: 10px;
    
    &::-webkit-scrollbar { width: 0; }

    .time-capsule {
      margin-bottom: 30px;
      .title {
        display: flex; align-items: center; gap: 10px; margin-bottom: 25px;
        font-size: 18px; font-weight: bold; color: #fff; letter-spacing: 1px;
      }

      .progress-list {
        display: flex; flex-direction: column; gap: 20px;
        .progress-item {
          .info {
            display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #fff;
            .name strong { font-weight: bold; color: #60a5fa; }
            .remaining { color: rgba(255,255,255,0.6); font-size: 12px; }
          }
          .progress-bg {
            width: 100%; height: 14px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; position: relative;
            .progress-bar { height: 100%; background: #fff; border-radius: 8px; transition: width 0.5s ease; }
            .percentage-text {
              position: absolute; width: 100%; text-align: center; top: 0; left: 0;
              font-size: 10px; color: #111; line-height: 14px; font-weight: bold; font-family: monospace;
            }
          }
        }
      }
    }

    .site-intro {
      border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 30px;
      .logo {
        margin-bottom: 15px;
        .main-text { font-size: 28px; font-weight: bold; color: #fff; font-family: "Pacifico-Regular", sans-serif; }
        .sub-text { font-size: 20px; color: rgba(255,255,255,0.7); font-weight: 300; }
      }
      .desc { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 30px; border-left: 2px solid rgba(255,255,255,0.3); padding-left: 10px; line-height: 1.6; }
      .sys-info {
        .info-row {
          display: flex; justify-content: space-between; font-family: monospace; font-size: 12px; margin-bottom: 12px;
          .label { color: rgba(255,255,255,0.5); letter-spacing: 1px; }
          .value { color: #fff; font-weight: bold; }
        }
      }
      .status-text { margin-top: 35px; text-align: center; font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.3); letter-spacing: 2px; }
    }
  }
}
</style>
