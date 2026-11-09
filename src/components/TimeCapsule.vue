<template>
  <section class="time-capsule" aria-labelledby="capsule-heading">
    <h2 id="capsule-heading"><HourglassFull size="23" /><span>时光胶囊</span></h2>
    <p class="region" v-if="context.timeZone">
      <span class="timezone-label">{{ context.timeZoneSource === 'device' ? '设备时区' : '网络 IP 时区' }} · {{ context.timeZone }}</span>
      <span v-if="context.location.city || context.location.region || context.location.country" class="weather-region">天气地区：{{ locationLabel }}（按网络 IP 估算）</span>
    </p>
    <p class="region" v-else>{{ context.status === 'loading' ? '正在读取网络时区…' : '当前无法判断时区' }}</p>
    <div v-for="item in progress" :key="item.name" class="capsule-item">
      <div class="info"><span>{{ item.name }}已度过 <strong>{{ item.passed }}</strong> {{ item.unit }}</span><span class="remaining">剩余 {{ item.remaining }} {{ item.unit }}</span><b>{{ item.percentage }}%</b></div>
      <div class="track" role="progressbar" :aria-label="item.name" :aria-valuenow="Number(item.percentage)" aria-valuemin="0" aria-valuemax="100"><i :style="{width: item.percentage + '%'}"></i></div>
    </div>
    <p class="note">时钟优先使用设备时区；检测不到时才回退到网络 IP 时区。天气地区按网络 IP 估算，VPN 或代理可能改变显示地区；不请求设备定位。</p>
  </section>
</template>
<script setup>
import { HourglassFull } from '@icon-park/vue-next';
import { useVisitorContext } from '@/composables/useVisitorContext';
const { context, progress, locationLabel } = useVisitorContext();
</script>
<style scoped lang="scss">
.time-capsule { width:100%; color:#efffff; }
h2 { display:flex; align-items:center; gap:10px; margin:0 0 12px; font-size:22px; }
.region { display:flex; flex-wrap:wrap; gap:4px 12px; margin:0 0 24px; font-size:13px; overflow-wrap:anywhere; }
.timezone-label { color:#a8edf0; }
.weather-region,.note { color:rgba(230,250,255,.6); }
.capsule-item { margin-bottom:20px; }
.info { display:flex; align-items:center; gap:12px; margin-bottom:9px; font-size:14px; }
strong { color:#65f4f1; } .remaining { margin-left:auto; color:rgba(230,250,255,.65); }
b { width:61px; text-align:right; font:12px monospace; color:#b9eeef; }
.track { height:9px; overflow:hidden; border-radius:8px; background:rgba(200,245,255,.15); }
.track i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#46cbcc,#b2fff9); transition:width .5s; }
.note { font-size:11px; line-height:1.7; margin:14px 0 0; }
@media(max-width:480px) { .info { gap:5px; font-size:12px; flex-wrap:wrap; } b { width:51px; font-size:11px; } .remaining { font-size:11px; } h2 { font-size:20px; } }
</style>
