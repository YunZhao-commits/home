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

  :deep(.function-card.discovery-clock) {
    position: relative;
    width: 100%;
    min-height: 276px;
    margin: 0 auto 34px;
    padding: 28px 22px 25px;
    overflow: hidden;
    transform: none;
    border: 1px solid rgba(202, 246, 255, 0.52);
    border-radius: 27px;
    background:
      radial-gradient(ellipse at 85% 18%, rgba(118, 223, 231, 0.18), transparent 34%),
      radial-gradient(ellipse at 12% 100%, rgba(20, 146, 178, 0.2), transparent 43%),
      linear-gradient(145deg, rgba(10, 65, 91, 0.82), rgba(5, 38, 60, 0.76));
    box-shadow: inset 0 1px 0 rgba(239, 252, 255, 0.13), 0 18px 42px rgba(0, 17, 32, 0.24);
  }

  :deep(.function-card.discovery-clock)::before {
    content: "";
    position: absolute;
    top: -96px;
    right: -64px;
    width: 250px;
    height: 250px;
    border: 1px solid rgba(194, 247, 255, 0.14);
    border-radius: 50%;
    box-shadow: 0 0 0 18px rgba(191, 244, 255, 0.025), 0 0 0 42px rgba(191, 244, 255, 0.018);
    pointer-events: none;
  }

  :deep(.function-card.discovery-clock .time),
  :deep(.function-card.discovery-clock .divider),
  :deep(.function-card.discovery-clock .weather) { position: relative; z-index: 1; }

  :deep(.function-card.discovery-clock .clock) {
    font-size: clamp(62px, 7vw, 82px);
    letter-spacing: 0.075em;
  }

  :deep(.function-card.discovery-clock .date) {
    width: min(100%, 248px);
    margin-top: 8px;
    font-size: 17px;
  }

  :deep(.function-card.discovery-clock .divider) { width: min(75%, 520px); margin: 17px 0 14px; }
  :deep(.function-card.discovery-clock .weather) { gap: 5px; }
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

    :deep(.function-card.discovery-clock) {
      min-height: 238px;
      margin-bottom: 28px;
      padding: 23px 16px 20px;
      border-radius: 23px;
    }

    :deep(.function-card.discovery-clock .clock) { font-size: clamp(58px, 15vw, 72px); }
    :deep(.function-card.discovery-clock .date) { font-size: 16px; }
    :deep(.function-card.discovery-clock .divider) { margin: 14px 0 11px; }
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
