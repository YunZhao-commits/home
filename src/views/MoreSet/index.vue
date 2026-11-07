<template>
  <section class="capsule-panel" role="dialog" aria-modal="true" aria-label="时光胶囊与站点说明" tabindex="-1" ref="panel" @click.stop @keydown.esc="close" @keydown.tab="trapFocus">
    <button class="close-btn" type="button" aria-label="关闭时光胶囊" @click="close">×</button>
    <TimeCapsule />
    <section class="site-intro">
      <h2>{{ settings.site_name }}</h2>
      <p class="description">分享我亲自发现和筛选的实用工具、会员权益与优惠。</p>
      <dl>
        <div><dt>分享内容</dt><dd>工具 · 会员 · 优惠</dd></div>
        <div><dt>链接说明</dt><dd>邀请链接会单独标注，具体权益和条件以平台官方页面为准。</dd></div>
        <div><dt>联系反馈</dt><dd>发现失效链接或有建议？<a :href="'mailto:' + settings.contact_email">发邮件给我 ↗</a></dd></div>
      </dl>
      <router-link to="/about" class="about-link" @click="close">了解本站与推广说明 →</router-link>
    </section>
  </section>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { mainStore } from '@/store';
import { useSite } from '@/composables/useSite';
import TimeCapsule from '@/components/TimeCapsule.vue';
const store=mainStore(), { settings }=useSite(), panel=ref(null);
let previousFocus;
const close=()=>{store.boxOpenState=false;store.setOpenState=false;};
function trapFocus(event) {
  const items=panel.value?.querySelectorAll('button, a[href], [tabindex="0"]');
  if (!items?.length) return;
  const first=items[0],last=items[items.length-1];
  if (event.shiftKey && (document.activeElement===first || document.activeElement===panel.value)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement===last) { event.preventDefault(); first.focus(); }
}
onMounted(async()=>{previousFocus=document.activeElement;await nextTick();panel.value?.focus();});
onBeforeUnmount(()=>previousFocus?.isConnected && previousFocus.focus());
</script>
<style scoped lang="scss">
.capsule-panel { position:relative; width:min(760px,100%); max-height:calc(100dvh - 48px); overflow-y:auto; padding:32px; box-sizing:border-box; border:1px solid rgba(176,239,245,.4); border-radius:24px; background:linear-gradient(145deg,rgba(3,35,51,.96),rgba(4,52,62,.93)); box-shadow:0 24px 80px #00121d70; backdrop-filter:blur(25px); color:#efffff; outline:none; }
.close-btn { position:absolute; right:14px; top:10px; width:40px; height:40px; border:0; border-radius:50%; background:transparent; color:#c2e8e8; font-size:30px; cursor:pointer; }
.close-btn:hover { background:#7df3f114; } .close-btn:focus-visible,a:focus-visible { outline:2px solid #7df3f1; outline-offset:3px; }
.site-intro { margin-top:26px; padding-top:24px; border-top:1px solid #c8f7ff26; }
h2 { margin:0 0 12px; font:27px Georgia,serif; }.description { font-size:14px; line-height:1.8; color:#d8ecee; }
dl { margin:20px 0; } dl div { display:grid; grid-template-columns:80px minmax(0,1fr); gap:16px; margin-bottom:14px; font-size:13px; line-height:1.7; }dt { color:#8db6bd; }dd { margin:0; }a { color:#76f6f0; text-decoration:none; }.about-link { font-size:13px; }
@media(max-width:480px) { .capsule-panel { padding:26px 18px; max-height:calc(100dvh - 24px); border-radius:18px; } dl div { grid-template-columns:64px minmax(0,1fr); gap:10px; } }
</style>
