<template>
  <div class="weather" title="按当前网络 IP 估算地区，不使用设备定位">

    <template v-if="status === 'loading'">
      <LoadingFour theme="outline" size="14" fill="rgba(255,255,255,0.6)" class="spin" />
      <span class="label">正在获取网络地区天气…</span>
    </template>

    <template v-else-if="status === 'error'">
      <Caution theme="filled" size="14" fill="#ff6b6b" />
      <span class="label err">天气暂不可用</span>
    </template>

    <template v-else>
      <div class="weather-main">
        <component
          :is="wmoInfo.icon"
          theme="filled"
          size="38"
          :fill="wmoInfo.fill"
          class="wx-icon"
        />
        <span class="temp">{{ temp }}<small>°C</small></span>
      </div>
      <div class="weather-caption">
        <span class="condition">{{ localizedCondition }}</span>
        <span class="separator" aria-hidden="true">·</span>
        <span class="city">
          {{ city }}
        </span>
      </div>
      <a class="attribution" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">天气 · Open-Meteo</a>
    </template>

  </div>
</template>

<script setup>
import {
  Sun,
  Moon,
  Cloudy,
  Umbrella,
  Snowflake,
  Lightning,
  LoadingFour,
  Caution,
} from "@icon-park/vue-next";
import { computed } from "vue";
import { useVisitorContext } from "@/composables/useVisitorContext";

// ─── WMO 4677 天气代码映射 ────────────────────────────────────────────
const WMO = {
  0:  { label: "CLEAR SKY",       icon: Sun,       fill: "#FFD166" },
  1:  { label: "MAINLY CLEAR",    icon: Sun,       fill: "#FFD166" },
  2:  { label: "PARTLY CLOUDY",   icon: Cloudy,    fill: "#A8BFCF" },
  3:  { label: "OVERCAST",        icon: Cloudy,    fill: "#8FA3B1" },
  45: { label: "FOG",             icon: Cloudy,    fill: "#9BA8AD" },
  48: { label: "ICING FOG",       icon: Cloudy,    fill: "#9BA8AD" },
  51: { label: "LIGHT DRIZZLE",   icon: Umbrella,  fill: "#7EC8E3" },
  53: { label: "DRIZZLE",         icon: Umbrella,  fill: "#7EC8E3" },
  55: { label: "HEAVY DRIZZLE",   icon: Umbrella,  fill: "#5BAFD6" },
  61: { label: "LIGHT RAIN",      icon: Umbrella,  fill: "#7EC8E3" },
  63: { label: "RAIN",            icon: Umbrella,  fill: "#5BAFD6" },
  65: { label: "HEAVY RAIN",      icon: Umbrella,  fill: "#3A96C9" },
  71: { label: "LIGHT SNOW",      icon: Snowflake, fill: "#DCF0FF" },
  73: { label: "SNOW",            icon: Snowflake, fill: "#DCF0FF" },
  75: { label: "HEAVY SNOW",      icon: Snowflake, fill: "#C8E6FF" },
  77: { label: "SNOW GRAINS",     icon: Snowflake, fill: "#C8E6FF" },
  80: { label: "SHOWERS",         icon: Umbrella,  fill: "#7EC8E3" },
  81: { label: "SHOWERS",         icon: Umbrella,  fill: "#5BAFD6" },
  82: { label: "HEAVY SHOWERS",   icon: Umbrella,  fill: "#3A96C9" },
  85: { label: "SNOW SHOWERS",    icon: Snowflake, fill: "#DCF0FF" },
  86: { label: "HEAVY SNOW SHW",  icon: Snowflake, fill: "#C8E6FF" },
  95: { label: "THUNDERSTORM",    icon: Lightning, fill: "#B48EF7" },
  96: { label: "T-STORM / HAIL",  icon: Lightning, fill: "#9B72E8" },
  99: { label: "T-STORM / HAIL",  icon: Lightning, fill: "#9B72E8" },
};

const { context, locationLabel: city } = useVisitorContext();
const status = computed(() => context.weatherStatus);
const temp = computed(() => context.weather?.temperature);
const wmoCode = computed(() => context.weather?.code);
const wmoInfo = computed(() => !context.weather?.isDay && [0,1].includes(wmoCode.value)
  ? { icon: Moon, fill: '#DCF0FF' } : WMO[wmoCode.value] ?? WMO[3]);

const localizedCondition = computed(() => {
  const code = Number(wmoCode.value);
  if (code === 0) return "晴朗";
  if (code === 1) return "晴间多云";
  if (code === 2) return "多云";
  if (code === 3) return "阴";
  if ([45, 48].includes(code)) return "有雾";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "有雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "有雪";
  if ([95, 96, 99].includes(code)) return "雷雨";
  return "天气";
});

</script>

<style lang="scss" scoped>
.weather {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace;
  letter-spacing: 0.035em;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;

  .attribution { color: rgba(255,255,255,.62); font-size: 11px; text-decoration: none; }
  .weather-main {
    min-height: 39px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
  }

  .weather-caption {
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: "HarmonyOS_Regular", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 15px;
    letter-spacing: 0.025em;
    color: rgba(255, 255, 255, 0.88);
  }

  .condition { color: rgba(255, 255, 255, 0.85); }
  .separator { color: rgba(222, 249, 255, 0.65); }

  .label {
    font-size: 11px;
    opacity: 0.6;
    &.err {
      color: #ff6b6b;
      opacity: 1;
    }
  }

  .wx-icon {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
  }

  .city {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: inherit;
    color: inherit;
    .loc-badge { flex-shrink: 0; }
  }

  .temp {
    font-size: 27px;
    font-weight: 400;
    font-family: Georgia, "Times New Roman", "Noto Serif CJK SC", "Songti SC", serif;
    color: #ffffff;
    letter-spacing: 0.02em;
    font-variant-numeric: lining-nums tabular-nums;
    font-feature-settings: "lnum" 1, "tnum" 1;
    small { margin-left: 0.08em; font-size: 0.62em; font-weight: 500; letter-spacing: 0.01em; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1.2s linear infinite;
    display: inline-flex;
  }

  @media (max-width: 720px) {
    gap: 2px;
    .weather-main { min-height: 28px; min-width: 80px; gap: 12px; }
    :deep(.wx-icon) { width: 24px !important; height: 24px !important; }
    :deep(.wx-icon svg) { width: 100% !important; height: 100% !important; }
    .temp { font-size: 18px; }
    .weather-caption { gap: 6px; font-size: 12px; }
  }
}
</style>
