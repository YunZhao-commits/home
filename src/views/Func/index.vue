<template>
  <section class="function-card" aria-label="当地时间与天气">
    <div class="time">
      <p class="clock" aria-label="当地时间">{{ clock?.hour || '—' }}<span class="clock-separator">:</span>{{ clock?.minute || '—' }}</p>
      <p v-if="clock" class="date" aria-label="当地日期">
        <span class="calendar-day">{{ clock.month }}月{{ clock.day }}日</span>
        <span class="date-divider" aria-hidden="true"></span>
        <span class="weekday">{{ clock.weekday }}</span>
      </p>
    </div>
    <div class="divider" aria-hidden="true"></div>
    <Weather />
  </section>
</template>

<script setup>
import Weather from "@/components/Weather.vue";
import { useVisitorContext } from "@/composables/useVisitorContext";
const { clock } = useVisitorContext();
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
    font-family: "HarmonyOS_Regular", "PingFang SC", "Microsoft YaHei", sans-serif;
  }

  .date {
    width: min(100%, 222px);
    min-height: 29px;
    margin: 7px auto 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 12px minmax(0, 1fr);
    align-items: center;
    color: rgba(246, 253, 255, 0.94);
    font-size: 16px;
    line-height: 1;
    letter-spacing: 0.035em;
    white-space: nowrap;

    .calendar-day { justify-self: end; }
    .weekday { justify-self: start; }
    .date-divider { justify-self: center; width: 1px; height: 15px; background: rgba(214, 247, 255, 0.42); }
  }

  .clock {
    margin: 0;
    color: #fff;
    font-family: Georgia, "Times New Roman", "Noto Serif", "Noto Serif SC", "Songti SC", serif;
    font-size: clamp(52px, 3.45vw, 62px);
    font-weight: 400;
    line-height: 1.04;
    letter-spacing: 0.055em;
    font-variant-numeric: lining-nums tabular-nums;
    font-feature-settings: "lnum" 1, "tnum" 1;
    text-shadow: 0 2px 20px rgba(110, 221, 255, 0.22);
  }

  .clock-separator {
    display: inline-block;
    margin: 0 0.025em;
    opacity: 0.72;
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
  .function-card .clock { font-size: 52px; }
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

    .date { width: min(100%, 206px); min-height: 27px; margin-top: 6px; font-size: clamp(14px, 3.8vw, 16px); }
    .date .date-divider { height: 13px; }
    .clock { font-size: clamp(50px, 14vw, 62px); line-height: 1.02; }
    .divider { width: 70%; margin: 8px 0 6px; }
  }
}
</style>
