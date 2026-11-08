<template>
  <section :class="['right', 'discovery-view', { hidden: !store.mobileOpenState }]" aria-label="云初分享入口">
    <header class="discovery-hero">
      <img class="brand-avatar" src="/images/avatar.png" alt="" width="58" height="58" />
      <div class="hero-copy">
        <p class="hero-kicker"><span aria-hidden="true">✦</span> YUNCHU STUDIO · DISCOVER</p>
        <h1>在星光下，发现值得收藏的好内容</h1>
        <p class="hero-description">实用工具、会员权益与优惠活动，经过整理后持续更新。</p>
      </div>
      <span class="hero-ornament" aria-hidden="true">✧</span>
    </header>

    <div class="local-context">
      <span class="context-indicator" aria-hidden="true"></span>
      <span>YOUR LOCAL SKY</span>
      <span class="context-divider" aria-hidden="true"></span>
      <span class="context-note">依网络地区显示当地时间与天气，不请求设备定位</span>
    </div>

    <Func class="discovery-clock" />
    <Link />
  </section>
</template>

<script setup>
import { mainStore } from "@/store";
import Func from "@/views/Func/index.vue";
import Link from "@/components/Links.vue";

const store = mainStore();
</script>

<style lang="scss" scoped>
.discovery-view {
  width: min(1040px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  color: #f5fcff;
  animation: fade 0.45s ease both;

  &.hidden { display: none; }

  .discovery-hero {
    position: relative;
    min-width: 0;
    margin: 0 0 23px;
    padding: 4px 4px 0;
    display: flex;
    align-items: center;
    gap: 17px;
  }

  .brand-avatar {
    width: 58px;
    height: 58px;
    flex: 0 0 58px;
    object-fit: cover;
    border: 1px solid rgba(193, 247, 255, 0.66);
    border-radius: 50%;
    box-shadow: 0 0 24px rgba(92, 215, 238, 0.26), inset 0 0 0 3px rgba(2, 27, 47, 0.36);
  }

  .hero-copy { min-width: 0; }

  .hero-kicker {
    margin: 0 0 5px;
    color: rgba(163, 241, 242, 0.84);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;

    span { margin-right: 5px; color: #8af5ef; font-size: 14px; }
  }

  h1 {
    margin: 0;
    color: #fbfeff;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
    font-size: clamp(23px, 3vw, 32px);
    font-weight: 600;
    letter-spacing: 0.045em;
    line-height: 1.35;
    text-shadow: 0 2px 18px rgba(3, 22, 39, 0.26);
  }

  .hero-description {
    margin: 6px 0 0;
    color: rgba(223, 241, 248, 0.72);
    font-size: 13px;
    line-height: 1.65;
  }

  .hero-ornament {
    margin-left: auto;
    padding: 0 10px;
    color: rgba(130, 239, 241, 0.62);
    font-size: 37px;
    text-shadow: 0 0 18px rgba(92, 222, 234, 0.45);
  }

  .local-context {
    min-height: 30px;
    margin: 0 2px 8px;
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgba(180, 233, 242, 0.78);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 10px;
    letter-spacing: 0.16em;
  }

  .context-indicator {
    width: 6px;
    height: 6px;
    flex: 0 0 6px;
    border-radius: 50%;
    background: #8df4de;
    box-shadow: 0 0 10px rgba(112, 255, 228, 0.84);
  }

  .context-divider { width: 1px; height: 12px; background: rgba(213, 245, 249, 0.28); }
  .context-note { color: rgba(215, 237, 245, 0.62); font-family: "HarmonyOS_Regular", "PingFang SC", sans-serif; font-size: 11px; letter-spacing: 0; }

}

@media (max-width: 720px) {
  .discovery-view {
    .discovery-hero { gap: 13px; margin-bottom: 18px; }
    .brand-avatar { width: 48px; height: 48px; flex-basis: 48px; }
    .hero-kicker { font-size: 9px; letter-spacing: 0.14em; }
    h1 { font-size: clamp(19px, 5.4vw, 25px); letter-spacing: 0.025em; }
    .hero-description { font-size: 12px; }
    .hero-ornament { padding: 0 2px; font-size: 28px; }
    .local-context { margin-bottom: 7px; gap: 7px; font-size: 9px; letter-spacing: 0.11em; }
    .context-note { font-size: 10px; }

  }
}

@media (max-width: 360px) {
  .discovery-view {
    .discovery-hero { align-items: flex-start; }
    .brand-avatar { width: 42px; height: 42px; flex-basis: 42px; }
    h1 { font-size: 18px; }
    .hero-description { font-size: 11px; }
    .hero-ornament { display: none; }
    .context-note { font-size: 9px; }
  }
}
</style>
