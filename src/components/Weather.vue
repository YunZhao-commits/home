<template>
  <div class="weather">

    <template v-if="status === 'loading'">
      <LoadingFour theme="outline" size="14" fill="rgba(255,255,255,0.6)" class="spin" />
      <span class="label">ACQUIRING SIGNAL…</span>
    </template>

    <template v-else-if="status === 'error'">
      <Caution theme="filled" size="14" fill="#ff6b6b" />
      <span class="label err">DATA LINK FAILED</span>
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
        <span class="temp">{{ temp }}°C</span>
      </div>
      <div class="weather-caption">
        <span class="condition">{{ localizedCondition }}</span>
        <span class="separator" aria-hidden="true">·</span>
        <span class="city">
          <LocalTwo
            v-if="isDefault"
            theme="filled"
            size="10"
            fill="#faad14"
            class="loc-badge"
            title="默认位置"
          />
          {{ city }}
        </span>
      </div>
    </template>

  </div>
</template>

<script setup>
import {
  Sun,
  Cloudy,
  Umbrella,
  Snowflake,
  Lightning,
  LoadingFour,
  Caution,
  LocalTwo,
} from "@icon-park/vue-next";
import { ref, computed, onMounted } from "vue";

// ─── 默认回退坐标（北京）──────────────────────────────────────────────
const DEFAULT_LAT  = 39.9042;
const DEFAULT_LON  = 116.4074;
const DEFAULT_CITY = "Beijing";

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

// ─── 响应式状态 ───────────────────────────────────────────────────────
const status    = ref("loading");   
const isDefault = ref(false);
const city      = ref("");
const temp      = ref(null);
const wmoCode   = ref(0);

// ─── 计算属性 ─────────────────────────────────────────────────────────
const wmoInfo = computed(() => WMO[wmoCode.value] ?? WMO[0]);

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

// ─── 核心修改：静默 IP 定位 API ───────────────────────────────────────
const fetchIPLocation = async () => {
  // 使用 GeoJS 接口，无需 Key，免跨域，100% 静默无弹窗
  const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
  if (!res.ok) throw new Error("IP Geolocation failed");
  const data = await res.json();
  return {
    lat: data.latitude,
    lon: data.longitude,
    cityName: data.city || "UNKNOWN",
  };
};

const fetchWeather = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current:   "temperature_2m,weather_code",
    timezone:  "auto",
  });
  const res  = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const data = await res.json();
  return data.current;
};

// ─── 数据写入 ─────────────────────────────────────────────────────────
const applyWeather = (cur) => {
  temp.value      = Math.round(cur.temperature_2m);
  wmoCode.value   = cur.weather_code;
  status.value    = "ready";
};

// ─── 回退：使用默认坐标 ───────────────────────────────────────────────
const loadDefault = async () => {
  try {
    isDefault.value = true;
    city.value      = DEFAULT_CITY;
    const cur       = await fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    applyWeather(cur);
  } catch {
    status.value = "error";
  }
};

// ─── 主入口 (纯净网络请求，告别 navigator.geolocation) ────────────────
const init = async () => {
  try {
    // 1. 静默获取 IP 对应坐标与城市
    const loc = await fetchIPLocation();
    city.value = loc.cityName;
    
    // 2. 携带坐标请求天气
    const cur = await fetchWeather(loc.lat, loc.lon);
    applyWeather(cur);
  } catch (err) {
    console.warn("Weather chain failed, falling back to default:", err);
    // 任何一环断裂（如挂了特殊代理），优雅降级到默认城市
    loadDefault();
  }
};

onMounted(init);
</script>

<style lang="scss" scoped>
.weather {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;

  .weather-main {
    min-height: 39px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .weather-caption {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: "HarmonyOS_Regular", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 15px;
    letter-spacing: 0.06em;
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
    .weather-main { min-height: 25px; gap: 7px; }
    .wx-icon { width: 24px; height: 24px; }
    .temp { font-size: 18px; }
    .weather-caption { gap: 6px; font-size: 12px; }
  }
}
</style>
