<template>
  <section class="function-card" aria-label="当地时间与天气">
    <div class="time">
      <p class="date">
        <span>{{ currentTime.year }} 年 </span>
        <span>{{ currentTime.month }} 月 </span>
        <span>{{ currentTime.day }} 日 </span>
        <span>{{ currentTime.weekday }}</span>
      </p>
      <p class="clock">{{ currentTime.hour }}:{{ currentTime.minute }}</p>
    </div>
    <div class="divider" aria-hidden="true"></div>
    <Weather />
  </section>
</template>

<script setup>
import { getCurrentTime } from "@/utils/getTime";
import Weather from "@/components/Weather.vue";

const currentTime = ref({});
let timeInterval;

const updateTimeData = () => {
  currentTime.value = getCurrentTime();
};

onMounted(() => {
  updateTimeData();
  timeInterval = setInterval(updateTimeData, 1000);
});

onBeforeUnmount(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style lang="scss" scoped>
.function-card {
  min-height: 238px;
  padding: 21px 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border: 1px solid rgba(202, 246, 255, 0.56);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(11, 70, 96, 0.72), rgba(14, 57, 81, 0.61));
  box-shadow: inset 0 0 22px rgba(178, 245, 255, 0.11), 0 8px 28px rgba(0, 22, 38, 0.22);
  backdrop-filter: blur(17px);
  -webkit-backdrop-filter: blur(17px);
  box-sizing: border-box;
  animation: fade 0.5s ease both;

  .time {
    width: 100%;
    text-align: center;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
  }

  .date {
    margin: 0;
    color: rgba(255, 255, 255, 0.97);
    font-size: 18px;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .clock {
    margin: 9px 0 0;
    color: #fff;
    font-size: clamp(48px, 4.1vw, 62px);
    line-height: 1;
    letter-spacing: 0.035em;
    text-shadow: 0 2px 16px rgba(110, 221, 255, 0.18);
  }

  .divider {
    width: 84%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(216, 248, 255, 0.6), transparent);
  }

  :deep(.weather) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;

    .wx-icon { width: 27px; height: 27px; }
    .city { font-size: 13px; letter-spacing: 0.12em; }
    .temp { font-size: 20px; }
  }
}

@media (max-width: 1100px) and (min-width: 721px) {
  .function-card { min-height: 218px; padding-inline: 14px; }
  .function-card .date { font-size: 15px; }
  .function-card .clock { font-size: 48px; }
  .function-card :deep(.weather .meta) { display: none; }
}

@media (max-width: 900px) and (min-width: 721px) {
  .function-card {
    width: min(100%, 560px);
    min-height: 190px;
    margin: 0 auto;
  }
}

@media (max-width: 720px) {
  .function-card {
    width: 100%;
    min-height: 126px;
    padding: 15px 12px 13px;
    gap: 10px;
    border-radius: 19px;

    .date { font-size: clamp(13px, 3.7vw, 16px); }
    .clock { margin-top: 5px; font-size: clamp(36px, 10vw, 45px); }
    .divider { width: 70%; }

    :deep(.weather) {
      gap: 7px;
      .wx-icon { width: 22px; height: 22px; }
      .city { font-size: 11px; }
      .temp { font-size: 16px; }
      .label { font-size: 9px; }
    }
  }
}
</style>
