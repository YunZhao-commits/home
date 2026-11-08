<template>
  <section class="function-card" aria-label="当地时间与天气">
    <div class="time-panel">
      <p class="panel-label" aria-hidden="true">LOCAL TIME</p>
      <div class="time">
        <p class="clock" aria-label="当地时间">{{ clock?.hour || '—' }}<span class="clock-separator">:</span>{{ clock?.minute || '—' }}</p>
        <p v-if="clock" class="date" aria-label="当地日期">
          <span class="calendar-day">{{ clock.month }}月{{ clock.day }}日</span>
          <span class="date-divider" aria-hidden="true"></span>
          <span class="weekday">{{ clock.weekday }}</span>
        </p>
      </div>
    </div>
    <div class="divider" aria-hidden="true"></div>
    <div class="weather-panel">
      <p class="panel-label" aria-hidden="true">LOCAL WEATHER</p>
      <Weather />
    </div>
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

  .time-panel,
  .weather-panel { display: contents; }

  .panel-label { display: none; }

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

// Expanded layout used only in the discovery/navigation view.
.function-card.discovery-clock {
  position: relative;
  width: 100%;
  min-height: 276px;
  margin: 0 auto 34px;
  padding: 30px clamp(22px, 4vw, 52px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  align-items: center;
  column-gap: clamp(24px, 4vw, 56px);
  overflow: hidden;
  transform: none;
  border: 1px solid rgba(202, 246, 255, 0.52);
  border-radius: 27px;
  background:
    radial-gradient(ellipse at 85% 18%, rgba(118, 223, 231, 0.18), transparent 34%),
    radial-gradient(ellipse at 12% 100%, rgba(20, 146, 178, 0.2), transparent 43%),
    linear-gradient(145deg, rgba(10, 65, 91, 0.82), rgba(5, 38, 60, 0.76));
  box-shadow: inset 0 1px 0 rgba(239, 252, 255, 0.13), 0 18px 42px rgba(0, 17, 32, 0.24);

  &::before {
    content: "";
    position: absolute;
    top: -104px;
    right: -66px;
    width: 250px;
    height: 250px;
    border: 1px solid rgba(194, 247, 255, 0.13);
    border-radius: 50%;
    box-shadow: 0 0 0 18px rgba(191, 244, 255, 0.025), 0 0 0 42px rgba(191, 244, 255, 0.018);
    pointer-events: none;
  }

  .time-panel,
  .weather-panel {
    position: relative;
    z-index: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .panel-label {
    width: min(100%, 220px);
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(200, 243, 249, 0.78);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.22em;
    line-height: 1;

    &::before,
    &::after {
      content: "";
      height: 1px;
      flex: 1;
      background: linear-gradient(90deg, transparent, rgba(209, 247, 250, 0.48));
    }

    &::after { transform: scaleX(-1); }
  }

  .time { width: 100%; }

  .clock {
    font-size: clamp(62px, 6vw, 84px);
    letter-spacing: 0.07em;
  }

  .date {
    width: min(100%, 248px);
    margin-top: 9px;
    font-size: 17px;
  }

  .divider {
    position: relative;
    z-index: 1;
    width: 1px;
    height: 74%;
    margin: 0;
    justify-self: center;
    background: linear-gradient(180deg, transparent, rgba(216, 248, 255, 0.7) 20%, rgba(216, 248, 255, 0.7) 80%, transparent);
  }

  :deep(.weather) { gap: 9px; }
  :deep(.weather-main) { gap: 20px; }
  :deep(.wx-icon) { width: 48px; height: 48px; }
  :deep(.wx-icon svg) { width: 100%; height: 100%; }
  :deep(.temp) { font-size: 36px; }
  :deep(.weather-caption) { font-size: 18px; }
  :deep(.attribution) { font-size: 12px; }
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

  .function-card.discovery-clock {
    min-height: 298px;
    margin-bottom: 28px;
    padding: 23px 17px 21px;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1px auto;
    row-gap: 18px;
    border-radius: 23px;

    .time-panel { grid-column: 1; grid-row: 1; }
    .divider {
      grid-column: 1;
      grid-row: 2;
      width: 74%;
      height: 1px;
      margin: 0;
      background: linear-gradient(90deg, transparent, rgba(216, 248, 255, 0.68), transparent);
    }
    .weather-panel { grid-column: 1; grid-row: 3; }
    .panel-label { margin-bottom: 11px; font-size: 9px; }
    .clock { font-size: clamp(58px, 15vw, 72px); }
    .date { width: min(100%, 220px); font-size: 15px; }
    :deep(.weather) { gap: 5px; }
    :deep(.weather-main) { gap: 13px; }
    :deep(.wx-icon) { width: 34px !important; height: 34px !important; }
    :deep(.wx-icon svg) { width: 100% !important; height: 100% !important; }
    :deep(.temp) { font-size: 27px; }
    :deep(.weather-caption) { font-size: 14px; }
  }
}
</style>
