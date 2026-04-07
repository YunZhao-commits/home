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
      <component
        :is="wmoInfo.icon"
        theme="filled"
        size="15"
        :fill="wmoInfo.fill"
        class="wx-icon"
      />
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
      <span class="temp">{{ temp }}°C</span>
      <span class="meta sm-hidden">{{ wmoInfo.label }}</span>
      <span class="meta sm-hidden">{{ windLabel }}</span>
      <span class="meta sm-hidden rh">RH {{ humidity }}%</span>
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
const DEFAULT_CITY = "BEIJING";

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

const WIND_DIRS = [
  "N","NNE","NE","ENE","E","ESE","SE","SSE",
  "S","SSW","SW","WSW","W","WNW","NW","NNW",
];

// ─── 响应式状态 ───────────────────────────────────────────────────────
const status    = ref("loading");   
const isDefault = ref(false);
const city      = ref("");
const temp      = ref(null);
const humidity  = ref(null);
const windSpeed = ref(null);
const windDeg   = ref(null);
const wmoCode   = ref(0);

// ─── 计算属性 ─────────────────────────────────────────────────────────
const wmoInfo = computed(() => WMO[wmoCode.value] ?? WMO[0]);

const windLabel = computed(() => {
  if (windSpeed.value == null) return "";
  const dir = WIND_DIRS[Math.round(windDeg.value / 22.5) % 16];
  return `${dir} ${Math.round(windSpeed.value)} KM/H`;
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
    current:   "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m",
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
  humidity.value  = cur.relative_humidity_2m;
  windSpeed.value = cur.wind_speed_10m;
  windDeg.value   = cur.wind_direction_10m;
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
    city.value = loc.cityName.toUpperCase();
    
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
  align-items: center;
  gap: 7px;
  font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;

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
  }

  .city {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    .loc-badge { flex-shrink: 0; }
  }

  .temp {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.02em;
  }

  .meta {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 0.07em;
  }

  .rh {
    color: rgba(120, 200, 255, 0.5);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1.2s linear infinite;
    display: inline-flex;
  }

  @media (max-width: 720px) {
    .sm-hidden { display: none; }
  }
}
</style>
