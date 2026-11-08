<template>
  <section v-if="siteLinks.length" class="links" aria-labelledby="explore-links-title">
    <header class="links-heading">
      <div class="heading-copy">
        <p class="eyebrow"><span class="eyebrow-star" aria-hidden="true">✦</span> EXPLORE · 云初精选</p>
        <h2 id="explore-links-title">从这里开始探索</h2>
        <p class="heading-description">好用的工具、值得了解的福利与优惠，都在这里慢慢整理。</p>
      </div>
      <div class="entry-count"><span>{{ String(siteLinks.length).padStart(2, '0') }}</span><span>个内容入口</span></div>
    </header>

    <nav class="link-grid" aria-label="内容分类与站点信息">
      <button
        v-for="item in siteLinks"
        :key="item.id"
        class="link-card cards"
        type="button"
        @click="jumpLink(item)"
      >
        <span class="icon-shell" aria-hidden="true">
          <component :is="iconMap[item.icon] || Folder" theme="outline" size="24" :stroke-width="2.2" />
        </span>
        <span class="card-copy">
          <span class="card-kicker">{{ item.kicker }}</span>
          <span class="card-title">{{ item.name }}</span>
          <span class="card-description">{{ item.subtitle }}</span>
        </span>
        <span class="card-arrow" aria-hidden="true">↗</span>
      </button>
    </nav>
  </section>
</template>

<script setup>
import { Folder, Star, Tool, VipOne, Ticket, Info, Mail } from "@icon-park/vue-next";
import { useRouter } from "vue-router";
import siteLinks from "@/assets/homeNavigation.json";
import { useSite } from "@/composables/useSite";

const router = useRouter();
const { settings } = useSite();
const iconMap = { Folder, Star, Tool, VipOne, Ticket, Info, Mail };

const jumpLink = (item) => {
  if (item.action === "contact") {
    const email = settings.value.contact_email;
    if (email) window.location.href = `mailto:${email}`;
    return;
  }
  if (item.url) router.push(item.url);
};
</script>

<style lang="scss" scoped>
.links {
  width: 100%;
  margin: 0 auto;
  animation: fade 0.5s ease both;

  .links-heading {
    margin: 0 0 18px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 7px;
    color: rgba(167, 246, 250, 0.88);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
  }

  .eyebrow-star { color: #70f2ed; font-size: 15px; }

  h2 {
    margin: 0;
    color: #f7fdff;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
    font-size: clamp(21px, 2vw, 27px);
    font-weight: 600;
    letter-spacing: 0.06em;
    line-height: 1.25;
  }

  .heading-description {
    margin: 7px 0 0;
    color: rgba(224, 242, 250, 0.7);
    font-size: 13px;
    line-height: 1.6;
  }

  .entry-count {
    display: flex;
    align-items: baseline;
    gap: 7px;
    flex: 0 0 auto;
    margin-bottom: 3px;
    color: rgba(220, 244, 250, 0.57);
    font-size: 12px;
    letter-spacing: 0.04em;

    span:first-child {
      color: #9beff0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      font-variant-numeric: tabular-nums;
    }
  }

  .link-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .link-card {
    position: relative;
    min-width: 0;
    min-height: 104px;
    padding: 17px 17px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid rgba(183, 235, 247, 0.19);
    border-radius: 17px;
    color: #f8fdff;
    text-align: left;
    cursor: pointer;
    background:
      radial-gradient(ellipse at 100% 0%, rgba(60, 199, 218, 0.13), transparent 48%),
      linear-gradient(135deg, rgba(5, 43, 62, 0.75), rgba(3, 30, 48, 0.78));
    box-shadow: inset 0 1px 0 rgba(238, 252, 255, 0.08), 0 10px 24px rgba(0, 15, 28, 0.12);
    transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;

    &:hover {
      transform: translateY(-3px);
      border-color: rgba(104, 239, 238, 0.55);
      background:
        radial-gradient(ellipse at 100% 0%, rgba(60, 226, 223, 0.2), transparent 54%),
        linear-gradient(135deg, rgba(7, 70, 88, 0.9), rgba(3, 39, 59, 0.92));
      box-shadow: inset 0 1px 0 rgba(238, 252, 255, 0.11), 0 12px 28px rgba(0, 20, 34, 0.25);
    }

    &:active { transform: translateY(-1px) scale(0.99); }

    &:focus-visible {
      outline: 2px solid #76f0ed;
      outline-offset: 3px;
    }
  }

  .icon-shell {
    width: 46px;
    height: 46px;
    display: grid;
    flex: 0 0 46px;
    place-items: center;
    border: 1px solid rgba(146, 239, 243, 0.24);
    border-radius: 14px;
    color: #9af6f1;
    background: linear-gradient(145deg, rgba(42, 187, 199, 0.23), rgba(63, 132, 172, 0.12));
    box-shadow: inset 0 1px 10px rgba(190, 251, 255, 0.08);
  }

  .card-copy {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
  }

  .card-kicker {
    color: rgba(155, 238, 240, 0.68);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 9px;
    letter-spacing: 0.16em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .card-title {
    overflow: hidden;
    color: #f5fcff;
    font-size: 16px;
    font-weight: 650;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-description {
    overflow: hidden;
    color: rgba(226, 243, 249, 0.67);
    font-size: 11px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-arrow {
    width: 27px;
    height: 27px;
    display: grid;
    flex: 0 0 27px;
    place-items: center;
    border: 1px solid rgba(183, 235, 247, 0.16);
    border-radius: 50%;
    color: rgba(224, 248, 250, 0.75);
    font-size: 15px;
    transition: transform 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }

  .link-card:hover .card-arrow {
    transform: translate(2px, -2px);
    border-color: rgba(104, 239, 238, 0.45);
    color: #8ff8f2;
  }
}

@media (max-width: 720px) {
  .links {
    .links-heading { margin-bottom: 14px; }
    .heading-description { max-width: 30em; font-size: 12px; }
    .entry-count { gap: 5px; font-size: 10px; }
    .entry-count span:first-child { font-size: 20px; }
    .link-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .link-card { min-height: 96px; padding: 13px 11px; gap: 9px; border-radius: 15px; }
    .icon-shell { width: 38px; height: 38px; flex-basis: 38px; border-radius: 12px; }
    .card-title { font-size: 14px; }
    .card-description { font-size: 10px; }
    .card-arrow { width: 23px; height: 23px; flex-basis: 23px; font-size: 13px; }
  }
}

@media (max-width: 360px) {
  .links {
    .links-heading { align-items: flex-start; }
    .entry-count { padding-top: 20px; }
    .link-grid { gap: 8px; }
    .link-card { min-height: 90px; padding: 11px 8px; gap: 7px; }
    .icon-shell { width: 33px; height: 33px; flex-basis: 33px; }
    .card-title { font-size: 13px; }
    .card-description { font-size: 9px; }
    .card-arrow { display: none; }
  }
}
</style>
