<template>
  <div v-if="siteLinks.length" class="links">

    <div class="line">
      <LinkTwo theme="outline" size="20" :stroke-width="3" />
      <span class="title">网站导航</span>
    </div>

    <Swiper
      :modules="swiperModules"
      :slides-per-view="1"
      :space-between="40"
      :pagination="needsPagination ? paginationConfig : false"
      :mousewheel="true"
    >
      <SwiperSlide v-for="(page, pageIndex) in pagedLinks" :key="pageIndex">
        <div class="link-grid">
          <div
            v-for="item in page"
            :key="item.id || item.name"
            class="item cards"
            @click="jumpLink(item)"
          >
            <component
              :is="iconMap[item.icon] || Folder"
              theme="outline"
              size="26"
              :stroke-width="3"
            />
            <span class="name text-hidden">{{ item.name }}</span>
          </div>
        </div>
      </SwiperSlide>

      <div v-if="needsPagination" class="swiper-pagination" />
    </Swiper>

  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Mousewheel } from 'swiper/modules'
import VanillaTilt from 'vanilla-tilt'

import {
  LinkTwo, Folder, Notebook, Cpu, Earth, Picture, ChartLine, Message as MessageIcon
} from '@icon-park/vue-next'

import siteLinks from '@/assets/siteLinks.json'

const PAGE_COLS = 3  
const PAGE_ROWS = 2  
const PAGE_SIZE = PAGE_COLS * PAGE_ROWS  

const iconMap = { Folder, Notebook, Cpu, Earth, Picture, ChartLine, Message: MessageIcon }

const swiperModules = [Pagination, Mousewheel]
const paginationConfig = { el: '.swiper-pagination', clickable: true, bulletElement: 'div' }

const pagedLinks = computed(() => {
  const pages = []
  for (let i = 0; i < siteLinks.length; i += PAGE_SIZE) {
    pages.push(siteLinks.slice(i, i + PAGE_SIZE))
  }
  return pages
})

const needsPagination = computed(() => siteLinks.length > PAGE_SIZE)

const jumpLink = (item) => {
  const url = item.url
  if (!url) return
  const isWebUrl = url.startsWith('https://') || url.startsWith('http://')
  if (isWebUrl) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = url
  }
}

onMounted(() => {
  nextTick(() => {
    VanillaTilt.init(document.querySelectorAll('.item.cards'), {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.25,
      scale: 1.02,
    })
  })
})
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fade 0.5s;

    .title {
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }

    @media (max-width: 768px) {
      margin: 1.25rem 0.25rem 0.6rem;
    }
  }

  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;

    @media (max-width: 768px) {
      left: 0;
      width: 100%;
      padding: 0;
    }

    .swiper-slide { height: 100%; }

    .swiper-pagination {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 20px;
        height: 4px;
        margin: 0 4px;
        border-radius: 4px;
        opacity: 0.2;
        transition: opacity 0.3s;

        &.swiper-pagination-bullet-active,
        &:hover { opacity: 1; }
      }
    }
  }

  .link-grid {
    display: grid;
    grid-template-columns: repeat(v-bind(PAGE_COLS), minmax(0, 1fr));
    grid-template-rows: repeat(v-bind(PAGE_ROWS), 1fr);
    gap: 15px;
    height: 220px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      grid-template-rows: unset !important;
      grid-auto-rows: minmax(48px, auto);
      height: auto !important;
      gap: 8px 10px;
    }

    @media (max-width: 359px) {
      grid-template-columns: 1fr !important; // 超窄屏（< 360px）自适应单列
      gap: 8px;
    }
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding: 0 5px;
    cursor: pointer;
    animation: fade 0.5s;
    transform-style: preserve-3d;
    border-radius: 12px;

    &:hover {
      background: rgb(0 0 0 / 40%);
      transition: 0.3s;
    }

    &:active { transform: scale(1) !important; }

    .name {
      font-size: 0.95rem;
      margin-left: 6px;
      white-space: nowrap;
    }

    // Tablet: icon-only to avoid cramping
    @media (min-width: 720px) and (max-width: 820px) {
      .name { display: none; }
    }

    // ── MOBILE ONLY (≤ 768px) ─────────────────────────────────────────────
    @media (max-width: 768px) {
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      min-height: 48px;
      padding: 6px 10px;
      border-radius: 10px;
      gap: 8px;

      :deep(.i-icon) {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 20px !important;
          height: 20px !important;
        }
      }

      .name {
        font-size: 0.78rem;
        line-height: 1.25;
        margin-left: 0;
        margin-top: 0;
        white-space: normal !important;
        text-align: left;
        word-break: break-word;
        flex: 1;
        min-width: 0;
      }
    }
  }
}
</style>
