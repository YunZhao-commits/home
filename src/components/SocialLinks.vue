<template>
  <nav class="social" aria-label="社交链接">
    <component
      :is="item.url ? 'a' : 'span'"
      v-for="item in socialLinks"
      :key="item.name"
      class="social-link"
      :class="{ 'is-unconfigured': !item.url }"
      :href="item.url"
      :target="item.url && !item.url.startsWith('mailto:') ? '_blank' : null"
      :rel="item.url && !item.url.startsWith('mailto:') ? 'noopener noreferrer' : null"
      :aria-label="item.url ? item.name : `${item.name} 链接尚未配置`"
      :aria-disabled="item.url ? null : 'true'"
      :title="item.url ? item.tip : `${item.name} 链接尚未配置`"
    >
      <img class="icon" :src="item.icon" alt="" width="27" height="27" />
      <span>{{ item.name }}</span>
    </component>
  </nav>
</template>

<script setup>
import baseLinks from "@/assets/socialLinks.json";
import { computed } from "vue";
import { useSite } from "@/composables/useSite";
const { settings } = useSite();
const safeWebUrl = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
};
const socialLinks = computed(() => baseLinks.map(item => ({
  ...item,
  url: item.name === "Email"
    ? `mailto:${settings.value.contact_email}`
    : safeWebUrl(settings.value[item.name === "WhatsApp" ? "whatsapp_url" : "telegram_url"]),
})));
</script>

<style lang="scss" scoped>
.social {
  width: 100%;
  min-height: 67px;
  margin-top: 27px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border: 1px solid rgba(202, 246, 255, 0.36);
  border-radius: 999px;
  background: linear-gradient(110deg, rgba(10, 70, 93, 0.58), rgba(18, 92, 116, 0.43));
  box-shadow: inset 0 0 18px rgba(178, 245, 255, 0.08), 0 7px 24px rgba(0, 22, 38, 0.16);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-sizing: border-box;

  .social-link {
    position: relative;
    min-width: 0;
    min-height: 48px;
    padding: 0 clamp(10px, 2vw, 27px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    color: rgba(255, 255, 255, 0.98);
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
    font-size: 19px;
    white-space: nowrap;
    transition: color 0.2s ease, transform 0.2s ease;

    & + .social-link::before {
      content: "";
      position: absolute;
      top: 7px;
      bottom: 7px;
      left: 0;
      width: 1px;
      background: rgba(227, 250, 255, 0.58);
    }

    &:hover {
      color: #c5fbff;
      text-decoration: none;
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 2px solid #7cf5f1;
      outline-offset: -3px;
      border-radius: 999px;
    }

    &.is-unconfigured {
      color: rgba(255, 255, 255, 0.62);
      cursor: default;
      transform: none;
      .icon { opacity: 0.62; }
    }
  }

  .icon {
    display: block;
    flex: 0 0 auto;
    object-fit: contain;
    filter: drop-shadow(0 1px 4px rgba(0, 22, 38, 0.25));
  }
}

@media (max-width: 720px) {
  .social {
    min-height: 57px;
    margin-top: 0;
    padding: 0 8px;

    .social-link {
      min-height: 44px;
      padding: 0 12px;
      gap: 8px;
      font-size: 14px;
    }

    .icon { width: 22px; height: 22px; }
  }
}

@media (max-width: 350px) {
  .social { padding-inline: 3px; }
  .social .social-link { padding-inline: 7px; gap: 6px; font-size: 12px; }
  .social .icon { width: 19px; height: 19px; }
}
</style>
