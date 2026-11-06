<template>
  <section class="function-card" aria-label="当地时间与天气">
    <div class="time">
      <p class="clock">{{ currentTime.hour }}:{{ currentTime.minute }}</p>
      <p class="date">
        <span>{{ currentTime.month }}月{{ currentTime.day }}日</span>
        <span>{{ weekday }}</span>
      </p>
    </div>
    <div class="divider" aria-hidden="true"></div>
    <Weather />
  </section>
</template>

<script setup>
import { getCurrentTime } from "@/utils/getTime";
import Weather from "@/components/Weather.vue";
import { computed } from "vue";

const currentTime = ref({});
const weekday = computed(() => (currentTime.value.weekday || "").replace("星期", "周"));
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
  transform: translateY(-35px);
  padding: 20px 20px 17px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
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
    margin: 5px 0 0;
    color: rgba(255, 255, 255, 0.97);
    display: flex;
    justify-content: center;
    gap: 14px;
    font-size: 17px;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .clock {
    margin: 0;
    color: #fff;
    font-family: Georgia, "Times New Roman", "Noto Serif CJK SC", "Songti SC", serif;
    font-size: clamp(48px, 3.2vw, 56px);
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.045em;
    text-shadow: 0 2px 16px rgba(110, 221, 255, 0.18);
  }

  .divider {
    width: 82%;
    height: 1px;
    margin: 14px 0 12px;
    background: linear-gradient(90deg, transparent, rgba(216, 248, 255, 0.72), transparent);
  }

  :deep(.weather) {
    align-items: center;
    justify-content: center;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
  }
}

@media (max-width: 1100px) and (min-width: 721px) {
  .function-card { min-height: 218px; padding-inline: 14px; }
  .function-card .date { font-size: 15px; }
  .function-card .clock { font-size: 48px; }
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
    min-height: 132px;
    padding: 13px 12px 12px;
    border-radius: 19px;

    .date { margin-top: 4px; gap: 8px; font-size: clamp(12px, 3.4vw, 15px); }
    .clock { font-size: clamp(34px, 9vw, 43px); }
    .divider { width: 70%; margin: 8px 0 6px; }
  }
}
</style>
